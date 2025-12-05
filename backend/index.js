const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const { Post, Community, User } = require("./models");

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

    if (postCount === 0) {
      const initialPosts = [
        {
          title: 'Yeni AI modeli GPT-5 duyuruldu! İşte detaylar',
          content: 'OpenAI bugün yapay zeka dünyasında devrim yaratacak yeni modelini tanıttı.',
          subreddit: 'teknoloji',
          author: 'techguru',
          votes: 2847,
          comments: 324,
        },
        {
          title: 'React 19 çıktı! Yeni özellikler ve değişiklikler',
          content: 'React ekibi uzun süredir beklenen 19. versiyonu sonunda yayınladı.',
          subreddit: 'programlama',
          author: 'coderlife',
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

    if (userCount === 0) {
      const initialUsers = [
        { username: 'techguru', email: 'tech@example.com', role: 'user' },
        { username: 'admin', email: 'admin@example.com', role: 'admin' },
        { username: 'coderlife', email: 'coder@example.com', role: 'user' },
      ];
      await User.insertMany(initialUsers);
      console.log("✓ Başlangıç kullanıcı verileri eklendi");
    }
  })
  .catch((err) => console.error("✗ MongoDB bağlantı hatası:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/dist")));

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
    const { title, content, subreddit, author, image } = req.body;

    // Validation
    if (!title || !subreddit) {
      return res.status(400).json({ message: "Başlık ve topluluk gereklidir" });
    }

    const newPost = new Post({
      title,
      content: content || null,
      subreddit,
      author: author || "anonymous",
      image: image || null,
      votes: 0,
      comments: 0,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE post
app.put("/api/posts/:id", async (req, res) => {
  try {
    const { title, content, subreddit } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, subreddit },
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

// DELETE post
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post bulunamadı" });
    }
    res.json(post);
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
    const users = await User.find().select("-password");
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
