const http = require("http");
const path = require("path");
const { readFile } = require("fs/promises");

const PORT = Number(process.env.PORT) || 3001;
const NEWS_FILE = path.join(__dirname, "news.json");
const NEWS_IMAGES = [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=900&q=80",
];
const newsImageById = new Map();
let remainingNewsImages = [...NEWS_IMAGES];

const sendJson = (response, statusCode, payload) => {
    response.writeHead(statusCode, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
    });
    response.end(JSON.stringify(payload));
};

const readNews = async () => {
    const file = await readFile(NEWS_FILE, "utf8");

    return JSON.parse(file);
};

const getRandomNewsImage = (newsItem) => {
    if (!newsImageById.has(newsItem.id)) {
        if (remainingNewsImages.length === 0) {
            remainingNewsImages = [...NEWS_IMAGES];
        }

        const randomIndex = Math.floor(Math.random() * remainingNewsImages.length);
        const [image] = remainingNewsImages.splice(randomIndex, 1);

        newsImageById.set(newsItem.id, image);
    }

    return newsImageById.get(newsItem.id);
};

const withImages = (news) => news.map((newsItem) => ({
    ...newsItem,
    image: getRandomNewsImage(newsItem),
}));

const getLimit = (url) => {
    const limit = Number(url.searchParams.get("limit"));

    if (!Number.isFinite(limit) || limit <= 0) {
        return null;
    }

    return Math.min(limit, 10);
};

const server = http.createServer(async (request, response) => {
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
    }

    if (request.method !== "GET") {
        sendJson(response, 405, {
            error: "Method not allowed",
        });
        return;
    }

    const url = new URL(request.url, `http://${request.headers.host}`);

    try {
        if (url.pathname === "/api/health") {
            sendJson(response, 200, {
                status: "ok",
            });
            return;
        }

        if (url.pathname === "/api/news" || url.pathname === "/api/news/popular") {
            const limit = getLimit(url);
            const shouldSortPopular = url.pathname === "/api/news/popular" || url.searchParams.get("sort") === "popular";
            let news = await readNews();

            if (shouldSortPopular) {
                news = news.sort((a, b) => b.popularity - a.popularity || b.views - a.views);
            }

            news = withImages(news);

            sendJson(response, 200, limit ? news.slice(0, limit) : news);
            return;
        }

        sendJson(response, 404, {
            error: "Not found",
        });
    } catch (error) {
        sendJson(response, 500, {
            error: "Failed to read news",
        });
    }
});

server.listen(PORT, () => {
    console.log(`News backend is running on http://localhost:${PORT}`);
});
