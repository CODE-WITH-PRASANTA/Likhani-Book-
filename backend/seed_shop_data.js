const http = require("http");

function request(options, postData = null) {
  return new Promise((resolve) => {
    const headers = { ...(options.headers || {}) };
    let payload = null;

    if (postData) {
      payload = typeof postData === "object" ? JSON.stringify(postData) : String(postData);
      headers["Content-Length"] = Buffer.byteLength(payload);
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
    }

    const req = http.request({ ...options, headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on("error", (err) => {
      resolve({ status: 500, error: err.message, data: err.message });
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

const categoriesData = [
  {
    name: "Fiction & Literature",
    description: "Classic and contemporary fiction, novels, and acclaimed literature.",
    color: "purple",
    books: [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        price: 450,
        offerPrice: 380,
        stock: 35,
        featured: true,
        description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        price: 550,
        offerPrice: 449,
        stock: 20,
        featured: false,
        description: "For years, rumors of the 'Marsh Girl' haunted Barkley Cove, a quiet fishing village. When handsome Chase Andrews is found dead, the locals suspect Kya Clark.",
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "The Song of Achilles",
        author: "Madeline Miller",
        price: 499,
        offerPrice: 399,
        stock: 40,
        featured: true,
        description: "A breathtaking, profoundly moving reimagining of the Iliad, centering on the legendary bond between Achilles and Patroclus in ancient Greece.",
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    name: "Science & Technology",
    description: "Cutting-edge software engineering, architecture, and computer science books.",
    color: "blue",
    books: [
      {
        title: "Clean Code: Agile Craftsmanship",
        author: "Robert C. Martin",
        price: 899,
        offerPrice: 749,
        stock: 25,
        featured: true,
        description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Master the principles of writing clean, maintainable code.",
        image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Designing Data-Intensive Applications",
        author: "Martin Kleppmann",
        price: 1200,
        offerPrice: 999,
        stock: 15,
        featured: true,
        description: "The definitive guide to the architecture, scalability, reliability, and maintainability of modern data systems and distributed databases.",
        image: "https://images.unsplash.com/photo-1507842229451-79b1be886a20?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Artificial Intelligence: A Modern Approach",
        author: "Stuart Russell & Peter Norvig",
        price: 1450,
        offerPrice: 1199,
        stock: 18,
        featured: false,
        description: "The leading textbook in AI, exploring intelligent agents, neural networks, machine learning algorithms, and probabilistic reasoning.",
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    name: "Business & Finance",
    description: "Wealth creation, entrepreneurship, investing, and practical business wisdom.",
    color: "emerald",
    books: [
      {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        price: 399,
        offerPrice: 299,
        stock: 50,
        featured: true,
        description: "Timeless lessons on wealth, greed, and happiness. Doing well with money isn't necessarily about what you know. It's about how you behave.",
        image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        price: 599,
        offerPrice: 420,
        stock: 60,
        featured: true,
        description: "An easy and proven way to build good habits and break bad ones. Transform your personal and professional life with small, daily incremental gains.",
        image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Zero to One: Notes on Startups",
        author: "Peter Thiel",
        price: 480,
        offerPrice: 375,
        stock: 30,
        featured: false,
        description: "How to build companies that create new things. The next Bill Gates will not build an operating system. The next Larry Page won't make a search engine.",
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    name: "History & Philosophy",
    description: "Ancient philosophy, world histories, and profound ideas that shaped civilizations.",
    color: "amber",
    books: [
      {
        title: "Sapiens: A Brief History of Humankind",
        author: "Yuval Noah Harari",
        price: 699,
        offerPrice: 520,
        stock: 45,
        featured: true,
        description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution, exploring how biology and history have defined us.",
        image: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Meditations",
        author: "Marcus Aurelius",
        price: 299,
        offerPrice: 220,
        stock: 40,
        featured: false,
        description: "The personal writings of the Roman Emperor Marcus Aurelius, offering enduring Stoic insights on self-discipline, mortality, and tranquility.",
        image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "The Republic",
        author: "Plato",
        price: 350,
        offerPrice: 280,
        stock: 25,
        featured: false,
        description: "Plato's seminal dialogue addressing justice, the character of the just city-state, and the ideal philosophic soul governing society.",
        image: "https://images.unsplash.com/photo-1495640388908-05fa85288e61?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  {
    name: "Self-Help & Wellness",
    description: "Mindfulness, physical health, emotional intelligence, and purposeful living.",
    color: "rose",
    books: [
      {
        title: "The Power of Now",
        author: "Eckhart Tolle",
        price: 450,
        offerPrice: 350,
        stock: 35,
        featured: true,
        description: "A guide to spiritual enlightenment that encourages readers to live fully in the present moment and break free from negative psychological spirals.",
        image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Ikigai: The Japanese Secret to Long Life",
        author: "Héctor García & Francesc Miralles",
        price: 399,
        offerPrice: 310,
        stock: 55,
        featured: false,
        description: "Find your purpose and embrace daily happiness with the wisdom of Okinawa, where the world's longest-living people find meaning in every day.",
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Deep Work: Rules for Focused Success",
        author: "Cal Newport",
        price: 520,
        offerPrice: 410,
        stock: 28,
        featured: true,
        description: "The ability to focus without distraction on a cognitively demanding task is the superpower of the modern economy. Learn how to master deep work.",
        image: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
];

async function seedData() {
  console.log("==================================================");
  console.log("SEEDING 5 CATEGORIES AND 15 BOOKS VIA API");
  console.log("==================================================\n");

  let totalCategoriesCreated = 0;
  let totalBooksCreated = 0;

  for (const cat of categoriesData) {
    console.log(`\n📁 Processing Category: "${cat.name}"...`);

    // 1. Create or ensure category
    const catRes = await request(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/categories",
        method: "POST",
      },
      {
        name: cat.name,
        description: cat.description,
        color: cat.color,
      }
    );

    if (catRes.status === 201) {
      console.log(`  ✓ Category created: "${cat.name}" (ID: ${catRes.data?.data?._id})`);
      totalCategoriesCreated++;
    } else if (catRes.status === 400 && String(catRes.data?.message).includes("already exists")) {
      console.log(`  ℹ Category already exists: "${cat.name}"`);
    } else {
      console.log(`  ⚠ Category response [${catRes.status}]:`, catRes.data?.message || catRes.data);
    }

    // 2. Create 3 books for this category via /api/book-posting
    for (const b of cat.books) {
      console.log(`   📖 Creating Book: "${b.title}"...`);
      const bookRes = await request(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/book-posting",
          method: "POST",
        },
        {
          title: b.title,
          author: b.author,
          category: cat.name,
          price: b.price,
          offerPrice: b.offerPrice,
          stock: b.stock,
          status: "Published",
          featured: b.featured,
          description: b.description,
          image: b.image,
          images: [b.image],
        }
      );

      if (bookRes.status === 201) {
        console.log(`     ✓ Book saved: "${b.title}" (ID: ${bookRes.data?.data?._id}) Price: ₹${b.price} -> ₹${b.offerPrice}`);
        totalBooksCreated++;
      } else {
        console.log(`     ✗ Failed to create book [${bookRes.status}]:`, bookRes.data?.message || bookRes.data);
      }
    }
  }

  console.log("\n==================================================");
  console.log(`SUMMARY: ${totalCategoriesCreated} new categories created, ${totalBooksCreated} books successfully posted to database!`);
  console.log("==================================================");
}

seedData();
