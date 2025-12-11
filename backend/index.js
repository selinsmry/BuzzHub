const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const { Post, Community, User } = require("./models");
const authRoutes = require("./routes/authRoutes");
const verifyToken = require("./middleware/verifyToken");
const verifyAdmin = require("./middleware/verifyAdmin");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/toplulukapp";

// MongoDB bağlantısı
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✓ MongoDB bağlantısı başarılı");
    
    // Başlangıç verilerini ekle (ilk kurulumda)
    const postCount = await Post.countDocuments();
    const communityCount = await Community.countDocuments();
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      const initialUsers = [
        { username: 'techguru', email: 'tech@example.com', password: await bcrypt.hash('pass123', 10), role: 'user' },
        { username: 'admin', email: 'admin@example.com', password: await bcrypt.hash('admin123', 10), role: 'admin' },
        { username: 'coderlife', email: 'coder@example.com', password: await bcrypt.hash('coder123', 10), role: 'user' },
      ];
      const createdUsers = await User.insertMany(initialUsers);
      console.log("✓ Başlangıç kullanıcı verileri eklendi");

      // Kullanıcılar eklendikten sonra postları ekle
      if (postCount === 0) {
        const techguruUser = createdUsers.find(u => u.username === 'techguru');
        const coderlifeUser = createdUsers.find(u => u.username === 'coderlife');

        const initialPosts = [
          {
            title: 'Yeni AI modeli GPT-5 duyuruldu! İşte detaylar',
            content: 'OpenAI bugün yapay zeka dünyasında devrim yaratacak yeni modelini tanıttı.',
            subreddit: 'teknoloji',
            author: 'techguru',
            userId: techguruUser?._id || null,
            votes: 2847,
            comments: 324,
          },
          {
            title: 'React 19 çıktı! Yeni özellikler ve değişiklikler',
            content: 'React ekibi uzun süredir beklenen 19. versiyonu sonunda yayınladı.',
            subreddit: 'programlama',
            author: 'coderlife',
            userId: coderlifeUser?._id || null,
            votes: 1523,
            comments: 187,
          },
        ];
        await Post.insertMany(initialPosts);
        console.log("✓ Başlangıç post verileri eklendi");
      }
    } else if (postCount === 0) {
      // Kullanıcılar zaten varsa postları ekle
      const users = await User.find({ username: { $in: ['techguru', 'coderlife'] } });
      const techguruUser = users.find(u => u.username === 'techguru');
      const coderlifeUser = users.find(u => u.username === 'coderlife');

      const initialPosts = [
        {
          title: 'Yeni AI modeli GPT-5 duyuruldu! İşte detaylar',
          content: 'OpenAI bugün yapay zeka dünyasında devrim yaratacak yeni modelini tanıttı.',
          subreddit: 'teknoloji',
          author: 'techguru',
          userId: techguruUser?._id || null,
          votes: 2847,
          comments: 324,
        },
        {
          title: 'React 19 çıktı! Yeni özellikler ve değişiklikler',
          content: 'React ekibi uzun süredir beklenen 19. versiyonu sonunda yayınladı.',
          subreddit: 'programlama',
          author: 'coderlife',
          userId: coderlifeUser?._id || null,
          votes: 1523,
          comments: 187,
        },
      ];
      await Post.insertMany(initialPosts);
      console.log("✓ Başlangıç post verileri eklendi");
    }

    if (communityCount === 0) {
      const initialCommunities = [
        { name: 'programlama', members: 15000, description: 'Programlama ve yazılım geliştirme topluluğu' },
        { name: 'teknoloji', members: 20000, description: 'Teknoloji haberleri ve tartışmalar' },
        { name: 'oyun', members: 18000, description: 'Oyun ve oyunculuk' },
        { name: 'spor', members: 12000, description: 'Spor haberleri' },
        { name: 'müzik', members: 8000, description: 'Müzik tartışmaları' },
      ];
      await Community.insertMany(initialCommunities);
      console.log("✓ Başlangıç topluluk verileri eklendi");
    }
  })
  .catch((err) => console.error("✗ MongoDB bağlantı hatası:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// ===== AUTH ROUTES =====
app.use("/api/auth", authRoutes);

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
app.get("/api/posts", verifyToken, async (req, res) => {
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
    const { title, content, subreddit, userId } = req.body;
    
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
      { title, content, subreddit },
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
