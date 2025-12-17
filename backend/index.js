const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const fs = require("fs");
require("dotenv").config();

const { Post, Community, User, Comment, Notification } = require("./models");
const authRoutes = require("./routes/authRoutes");
const communityRoutes = require("./routes/communityRoutes");
const verifyToken = require("./middleware/verifyToken");
const verifyAdmin = require("./middleware/verifyAdmin");
const upload = require("./middleware/uploadMiddleware");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI
// MongoDB bağlantısı
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✓ MongoDB bağlantısı başarılı");
    
    // Başlangıç verilerini ekle (ilk kurulumda)
    const postCount = await Post.countDocuments();
    const communityCount = await Community.countDocuments();
    const userCount = await User.countDocuments();
  })
  .catch((err) => console.error("✗ MongoDB bağlantı hatası:", err));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth Routes
app.use("/api/auth", authRoutes);

// Community Routes
app.use("/api/communities", communityRoutes);

// ===== DEBUG API =====
// Tüm postları listele (debug için)
app.get("/api/debug/posts", async (req, res) => {
  try {
    const posts = await Post.find().select("_id title author userId createdAt");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database'i sıfırla (TESTİNG İÇİN)
app.post("/api/debug/reset", async (req, res) => {
  try {
    await Post.deleteMany({});
    await User.deleteMany({});
    await Community.deleteMany({});
    res.json({ message: "Database temizlendi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Migration endpoint to initialize userVotes field for existing posts
app.post("/api/debug/migrate-votes", async (req, res) => {
  try {
    const result = await Post.updateMany(
      { userVotes: { $exists: false } },
      { $set: { userVotes: [] } }
    );
    res.json({ 
      message: "Oy migration tamamlandı",
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===== VOTES API =====
// GET all posts with votes
app.get("/api/votes", async (req, res) => {
  try {
    const posts = await Post.find().select("title votes");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// UPDATE post vote - JWT koruması ile
app.put("/api/votes/:id", verifyToken, async (req, res) => {
  try {
    // JWT token'dan kullanıcı bilgisi alınıyor
    const userId = req.user.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Giriş yapılmamış kullanıcı" });
    }

    const { voteType } = req.body; // 'up', 'down', or null (to remove vote)
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Initialize userVotes if it doesn't exist
    if (!post.userVotes) {
      post.userVotes = [];
    }

    // Check if user has already voted
    const existingVoteIndex = post.userVotes.findIndex(
      v => v.userId.toString() === userId.toString()
    );

    let voteChange = 0;

    if (voteType === null) {
      // Remove vote
      if (existingVoteIndex !== -1) {
        const removedVote = post.userVotes[existingVoteIndex];
        voteChange = removedVote.voteType === 'up' ? -1 : 1;
        post.userVotes.splice(existingVoteIndex, 1);
      }
    } else if (existingVoteIndex !== -1) {
      // User already voted - change vote
      const oldVote = post.userVotes[existingVoteIndex];
      if (oldVote.voteType === voteType) {
        // Same vote type - remove it
        voteChange = voteType === 'up' ? -1 : 1;
        post.userVotes.splice(existingVoteIndex, 1);
      } else {
        // Different vote type - change it
        voteChange = voteType === 'up' ? 2 : -2;
        post.userVotes[existingVoteIndex].voteType = voteType;
      }
    } else {
      // First vote
      voteChange = voteType === 'up' ? 1 : -1;
      post.userVotes.push({
        userId: userId,
        voteType: voteType
      });
    }

    // Update vote count
    post.votes += voteChange;
    await post.save();

    // Calculate current user's vote status
    const userVoteRecord = post.userVotes.find(
      v => v.userId.toString() === userId.toString()
    );
    const userVoteStatus = userVoteRecord ? userVoteRecord.voteType : null;

    res.json({
      votes: post.votes,
      userVoteStatus: userVoteStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user's vote status for a post
app.get("/api/votes/:id/user-vote", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Initialize userVotes if it doesn't exist
    if (!post.userVotes) {
      post.userVotes = [];
      await post.save();
    }

    // Find if user has voted on this post
    const userVote = post.userVotes.find(
      v => v.userId.toString() === userId.toString()
    );

    res.json({
      voteStatus: userVote ? userVote.voteType : null,
      totalVotes: post.votes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===== POSTS API =====
// GET all posts
app.get("/api/posts", async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter = {};
    if (req.query.communityId) {
      filter.communities = req.query.communityId;
    }
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    
    const posts = await Post.find(filter).skip(skip).limit(limit).sort({createdAt: -1}).populate('userId', 'username profile_picture');

    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.json({posts,pagination:{
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
    }});
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single post
app.get("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new post
app.post("/api/posts", verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, content, subreddit, author, image, userId, communityId } = req.body;
    
    console.log('DEBUG POST /api/posts - Received:', { title, content, subreddit, author, image, userId, communityId });
    console.log('DEBUG POST /api/posts - File:', req.file);

    // Validation
    if (!title || !subreddit) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: "Başlık ve topluluk gereklidir" });
    }

    // Get community name and ID
    let communityName = subreddit;
    let communityObjectId = communityId;
    try {
      // Check if subreddit is a valid MongoDB ObjectId
      if (subreddit.match(/^[0-9a-fA-F]{24}$/)) {
        const community = await Community.findById(subreddit);
        if (community) {
          communityName = community.name;
          communityObjectId = subreddit;
        }
      }
    } catch (err) {
      console.log('Could not fetch community:', err.message);
      // If community not found, use subreddit as is
    }

    // Get image URL
    let imageUrl = image || null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const newPost = new Post({
      title,
      content: content || null,
      subreddit: communityName,
      communities: communityObjectId,
      author: req.user.username,  
      userId: req.user.id,       
      image: imageUrl,
      votes: 0,
      comments: 0,
    });

    console.log('DEBUG POST /api/posts - newPost before save:', newPost);
    const savedPost = await newPost.save();
    console.log('DEBUG POST /api/posts - savedPost after save:', savedPost);
    res.status(201).json(savedPost);
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('DEBUG POST /api/posts - Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE post (only post owner can update)
app.put("/api/posts/:id", verifyToken, async (req, res) => {
  try {
    const { title, content, subreddit, communityId, link, image } = req.body;
    const userId = req.user.id; // verifyToken'ten gelen user ID'si
    
    // Gönderiyi bul
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Sadece postu yazan kullanıcı güncelleyebilir
    if (post.userId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Sadece postu yazan kullanıcı bunu güncelleyebilir" 
      });
    }

    // Get community name if subreddit is a community ID
    let communityName = subreddit;
    let communityObjectId = communityId;
    if (subreddit) {
      try {
        if (subreddit.match(/^[0-9a-fA-F]{24}$/)) {
          const community = await Community.findById(subreddit);
          if (community) {
            communityName = community.name;
            communityObjectId = subreddit;
          }
        }
      } catch (err) {
        console.log('Could not fetch community:', err.message);
      }
    }

    // Build update object
    const updateData = {
      title,
      subreddit: communityName,
      communities: communityObjectId
    };

    // Add content, link, or image if provided
    if (content) {
      updateData.content = content;
    }
    if (link) {
      updateData.link = link;
    }
    if (image) {
      updateData.image = image;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE post (only post owner can delete)
app.delete("/api/posts/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // verifyToken'ten gelen user ID'si
    
    // Gönderiyi bul
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Sadece postu yazan kullanıcı silebilir
    if (post.userId && post.userId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Sadece postu yazan kullanıcı bunu silebilir" 
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post başarıyla silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== USERS API =====
// GET all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single user
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by username
app.get("/api/users/username/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE user
app.post("/api/users", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: "Kullanıcı adı ve email gereklidir" });
    }

    const newUser = new User({
      username,
      email,
      password: password || "default",
      role: role || "user",
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { username, email, role, is_suspended, suspension_reason } = req.body;
    const updateData = { username, email, role };
    
    // Eğer is_suspended değiştiriliyorsa güncelle
    if (is_suspended !== undefined) {
      updateData.is_suspended = is_suspended;
    }
    
    // Suspension sebebi varsa güncelle
    if (suspension_reason !== undefined) {
      updateData.suspension_reason = suspension_reason;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete("/api/users/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== COMMENTS API =====
// GET all comments for a post
app.get("/api/posts/:postId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all comments for a user
app.get("/api/comments", async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "userId parametresi gereklidir" });
    }

    const comments = await Comment.find({ userId: userId })
      .populate('userId', 'username')
      .populate('postId', 'title')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single comment
app.get("/api/comments/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('userId', 'username')
      .populate('postId', 'title');
    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE comment
app.post("/api/comments", upload.single('image'), async (req, res) => {
  try {
    const { title, content, userId, postId } = req.body;
    
    console.log('Yorum oluşturma isteği:', {
      title: !!title,
      content: !!content,
      userId: !!userId,
      postId: !!postId,
      received: req.body
    });

    // Validation
    if (!title || !content || !userId || !postId) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        message: "Tüm alanlar gereklidir: title, content, userId, postId",
        received: req.body
      });
    }

    // Post'un var olduğunu kontrol et
    const post = await Post.findById(postId);
    if (!post) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Get image URL
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Yeni yorum oluştur
    const newComment = new Comment({
      title,
      content,
      userId,
      postId,
      image: imageUrl,
    });

    const savedComment = await newComment.save();
    
    // Post'un yorum sayısını güncelle
    post.comments += 1;
    await post.save();

    // Oluşturulan yorumu kullanıcı bilgisiyle birlikte geri döndür
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('userId', 'username');
    
    res.status(201).json(populatedComment);
  } catch (err) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Yorum oluşturulurken hata:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE comment (only comment owner can update)
app.put("/api/comments/:id", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    
    // Yorumu bul
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    // Sadece yorumu yazan kullanıcı güncelleyebilir
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Sadece yorumu yazan kullanıcı bunu güncelleyebilir" 
      });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      { title, content },
      { new: true }
    ).populate('userId', 'username');
    
    res.json(updatedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE comment (only comment owner can delete)
app.delete("/api/comments/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Yorumu bul
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "Yorum bulunamadı" });
    }

    // Sadece yorumu yazan kullanıcı silebilir
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Sadece yorumu yazan kullanıcı bunu silebilir" 
      });
    }

    // Yorumu sil
    await Comment.findByIdAndDelete(req.params.id);
    
    // Post'un yorum sayısını güncelle
    const post = await Post.findById(comment.postId);
    if (post && post.comments > 0) {
      post.comments -= 1;
      await post.save();
    }

    res.json({ message: "Yorum başarıyla silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend çalışıyor!" });
});

// Server'ı başlat
app.listen(PORT, () => {
  console.log(`✓ Server http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`✓ API: http://localhost:${PORT}/api`);
  console.log(`✓ MongoDB URI: ${MONGODB_URI}`);
});