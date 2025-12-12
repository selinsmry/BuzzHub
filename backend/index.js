const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const http = require("http");
const socketIO = require("socket.io");
require("dotenv").config();

const { Post, Community, User } = require("./models");

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

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


// UPDATE post vote
app.put("/api/votes/:id", async (req, res) => {
  try {
    const { votes } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { votes },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===== POSTS API =====
// GET all posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
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
app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, subreddit, author, image, userId } = req.body;
    
    console.log('DEBUG POST /api/posts - Received:', { title, content, subreddit, author, image, userId });

    // Validation
    if (!title || !subreddit) {
      return res.status(400).json({ message: "Başlık ve topluluk gereklidir" });
    }

    const newPost = new Post({
      title,
      content: content || null,
      subreddit,
      author: author || "anonymous",
      userId: userId || null,
      image: image || null,
      votes: 0,
      comments: 0,
    });

    console.log('DEBUG POST /api/posts - newPost before save:', newPost);
    const savedPost = await newPost.save();
    console.log('DEBUG POST /api/posts - savedPost after save:', savedPost);
    res.status(201).json(savedPost);
  } catch (err) {
    console.error('DEBUG POST /api/posts - Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE post (only post owner can update)
app.put("/api/posts/:id", async (req, res) => {
  try {
    const { title, content, subreddit, userId,communityId } = req.body;
    
    // Gönderiyi bul
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Sadece postu yazan kullanıcı güncelleyebilir
    if (post.userId && userId && post.userId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Sadece postu yazan kullanıcı bunu güncelleyebilir" 
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, subreddit,communityId },
      { new: true }
    );
    
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE post (only post owner can delete)
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Gönderiyi bul
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Sadece postu yazan kullanıcı silebilir
    if (post.userId && userId && post.userId.toString() !== userId) {
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

// ===== COMMUNITIES API =====
// GET all communities
app.get("/api/communities", async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single community
app.get("/api/communities/:id", async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }
    res.json(community);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE community
app.post("/api/communities", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Topluluk adı gereklidir" });
    }

    const newCommunity = new Community({
      name,
      description: description || "",
      members: 0,
    });

    const savedCommunity = await newCommunity.save();
    res.status(201).json(savedCommunity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE community
app.put("/api/communities/:id", async (req, res) => {
  try {
    const { name, description } = req.body;
    const community = await Community.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );
    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }
    res.json(community);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE community
app.delete("/api/communities/:id", async (req, res) => {
  try {
    const community = await Community.findByIdAndDelete(req.params.id);
    if (!community) {
      return res.status(404).json({ message: "Topluluk bulunamadı" });
    }
    res.json(community);
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
    const { username, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
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
app.delete("/api/users/:id", async (req, res) => {
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
app.post("/api/comments", async (req, res) => {
  try {
    const { title, context, userId, postId } = req.body;

    // Validation
    if (!title || !context || !userId || !postId) {
      return res.status(400).json({ message: "Tüm alanlar gereklidir: title, context, userId, postId" });
    }

    // Post'un var olduğunu kontrol et
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }

    // Yeni yorum oluştur
    const newComment = new Comment({
      title,
      context,
      userId,
      postId,
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
    console.error('Yorum oluşturulurken hata:', err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE comment (only comment owner can update)
app.put("/api/comments/:id", async (req, res) => {
  try {
    const { title, context, userId } = req.body;
    
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
      { title, context },
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

// ===== NOTIFICATIONS API =====
// GET recent notifications for user (last 50)
app.get("/api/notifications/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.params.userId })
      .populate('senderId', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE notification (internal - called by socket events)
const createNotification = async (recipientId, senderId, type, message, targetId = null, targetType = null) => {
  try {
    const notification = new Notification({
      recipientId,
      senderId,
      type,
      message,
      targetId,
      targetType,
    });
    const saved = await notification.save();
    const populated = await saved.populate('senderId', 'username');
    return populated;
  } catch (err) {
    console.error('Bildirim oluşturma hatası:', err);
    return null;
  }
};

// DELETE notification
app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }
    res.json({ message: "Bildirim silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server'ı HTTP sunucusu olarak başlat ve Socket.io'yu ekle
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Bağlı kullanıcıları takip et
const connectedUsers = new Map();

io.on("connection", (socket) => {
  console.log("✓ Yeni socket bağlantısı:", socket.id);

  // Kullanıcı join ettiğinde oda oluştur
  socket.on("user-join", (userId) => {
    socket.join(`user-${userId}`);
    connectedUsers.set(userId, socket.id);
    console.log(`✓ Kullanıcı ${userId} odaya katıldı`);
    io.emit("user-status", { userId, status: "online" });
  });

  // Yorum yapıldığında bildirim gönder
  socket.on("post-commented", async (data) => {
    try {
      const { postAuthorId, commentAuthorId, commentAuthorUsername, postTitle, postId } = data;
      if (postAuthorId === commentAuthorId) return; // Kendi postuna yorum yapıyorsa bildirim yok
      
      const message = `${commentAuthorUsername} gönderinize yorum yaptı: "${postTitle}"`;
      const notification = await createNotification(
        postAuthorId,
        commentAuthorId,
        'comment',
        message,
        postId,
        'Post'
      );
      if (notification) {
        io.to(`user-${postAuthorId}`).emit('notification', notification);
      }
    } catch (err) {
      console.error("Yorum bildirimi gönderme hatası:", err);
    }
  });

  // Like yapıldığında bildirim gönder
  socket.on("post-liked", async (data) => {
    try {
      const { postAuthorId, likerUserId, likerUsername, postTitle, postId } = data;
      if (postAuthorId === likerUserId) return; // Kendi postuna like atıyorsa bildirim yok
      
      const message = `${likerUsername} gönderinizi beğendi: "${postTitle}"`;
      const notification = await createNotification(
        postAuthorId,
        likerUserId,
        'like',
        message,
        postId,
        'Post'
      );
      if (notification) {
        io.to(`user-${postAuthorId}`).emit('notification', notification);
      }
    } catch (err) {
      console.error("Like bildirimi gönderme hatası:", err);
    }
  });

  // Dislike yapıldığında bildirim gönder
  socket.on("post-disliked", async (data) => {
    try {
      const { postAuthorId, dislikerUserId, dislikerUsername, postTitle, postId } = data;
      if (postAuthorId === dislikerUserId) return;
      
      const message = `${dislikerUsername} gönderinizi beğenmedi: "${postTitle}"`;
      const notification = await createNotification(
        postAuthorId,
        dislikerUserId,
        'dislike',
        message,
        postId,
        'Post'
      );
      if (notification) {
        io.to(`user-${postAuthorId}`).emit('notification', notification);
      }
    } catch (err) {
      console.error("Dislike bildirimi gönderme hatası:", err);
    }
  });

  // (follow feature removed) previously handled 'user-followed' socket event

  // Kullanıcı çıktığında
  socket.on("disconnect", () => {
    console.log("✗ Socket bağlantısı kesildi:", socket.id);
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        io.emit("user-status", { userId, status: "offline" });
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`✓ Server http://localhost:${PORT} adresinde çalışıyor`);
  console.log(`✓ API: http://localhost:${PORT}/api`);
  console.log(`✓ WebSocket: ws://localhost:${PORT}`);
  console.log(`✓ MongoDB URI: ${MONGODB_URI}`);
});

// ===== VOTES API =====
app.post("/api/votes", async (req, res) => {
  try {
    const { userId, targetId, targetType, value } = req.body;
    // value: 1 = upvote, -1 = downvote

    if (!userId || !targetId || !targetType) {
      return res.status(400).json({ message: "Eksik veri" });
    }

    // Kullanıcı daha önce bu post/comment için oy vermiş mi?
    let vote = await Vote.findOne({ userId, targetId, targetType });

    if (!vote) {
      // İlk defa oy veriyorsa → yeni kayıt oluştur
      vote = await Vote.create({ userId, targetId, targetType, value });
    } else {
      // Aynı oyu tekrar veriyorsa → oyu kaldır (unvote)
      if (vote.value === value) {
        await Vote.deleteOne({ _id: vote._id });

        // Yeni skoru hesapla
        const aggregated = await Vote.aggregate([
          { $match: { targetId, targetType } },
          { $group: { _id: null, total: { $sum: "$value" } } }
        ]);

        const newScore = aggregated[0]?.total || 0;

        // Post veya yorum oy sayısını güncelle
        if (targetType === "post") {
          await Post.findByIdAndUpdate(targetId, { votes: newScore });
        }

        return res.json({ newScore });
      }

      // Farklı oy vermişse → güncelle
      vote.value = value;
      await vote.save();
    }

    // Yeni skoru hesapla
    const aggregated = await Vote.aggregate([
      { $match: { targetId, targetType } },
      { $group: { _id: null, total: { $sum: "$value" } } }
    ]);

    const newScore = aggregated[0]?.total || 0;

    // Post veya yorum skorunu güncelle
    if (targetType === "post") {
      await Post.findByIdAndUpdate(targetId, { votes: newScore });
    }

    res.json({ newScore });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

