"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const app = (0, express_1.default)();
const port = 5000;
const configAxios = axios_1.default.create({
    headers: {
        "User-Agent": "PostmanRuntime/7.42.0",
        // "Origin" : "https://samehadaku.email",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive"
    },
    baseURL: "https://samehadaku.email"
});
app.use((0, cors_1.default)());
function formatSlug(type, link) {
    const href = link.match(new RegExp(`${type}\/(.*?)(\/|$)`));
    return href ? href[1] : "";
}
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const episodes = [];
    const page = req.query.page || 1;
    const response = yield configAxios.get(`/anime-terbaru/page/${page}`);
    console.log(cheerio);
    const $ = cheerio.load(response.data);
    $(".post-show").find("ul > li").each((index, li) => {
        var _a;
        episodes.push({
            title: $(li).find("h2").text(),
            image: $(li).find(".thumb > a > img").attr("src"),
            episode: $(li).find(".dtla > span").eq(0).find("author").text(),
            posted: $(li).find(".dtla > span").eq(1).find("author").text(),
            date: ($(li).find(".dtla > span").eq(2).text()).split(" Released on: ")[1],
            slug: ((_a = $(li).find("h2 > a").attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[3]) || "",
        });
    });
    return res.json(episodes);
}));
app.get("/episode", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const episodes = [];
    const page = req.query.page || 1;
    const response = yield configAxios.get(`/anime-terbaru/page/${page}`);
    console.log(cheerio);
    const $ = cheerio.load(response.data);
    $(".post-show").find("ul > li").each((index, li) => {
        var _a;
        episodes.push({
            title: $(li).find("h2").text(),
            image: $(li).find(".thumb > a > img").attr("src"),
            episode: $(li).find(".dtla > span").eq(0).find("author").text(),
            posted: $(li).find(".dtla > span").eq(1).find("author").text(),
            date: ($(li).find(".dtla > span").eq(2).text()).split(" Released on: ")[1],
            slug: ((_a = $(li).find("h2 > a").attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[3]) || "",
        });
    });
    return res.json(episodes);
}));
app.get("/episode/:slug/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const response = yield configAxios.get(`https://samehadaku.email/${slug}/`);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if (title === "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok" ||
        title === "Anime Terbaru - Samehadaku" ||
        title === "Daftar Anime - Samehadaku" ||
        title === "Jadwal Rilis - Samehadaku" ||
        slug === "anime" ||
        slug === "producers" ||
        slug === "studio" ||
        slug === "season" ||
        slug === "genre" ||
        slug === "jadwal-rilis") {
        return res.status(404).send("Episode tidak ditemukan");
    }
    const genre = [];
    $(".genre-info > a").each((index, a) => {
        genre.push({
            title: $(a).text(),
            slug: formatSlug("genre", $(a).attr("href") || "")
        });
    });
    const episode = [];
    $(".lstepsiode > ul > li").each((index, li) => {
        var _a;
        episode.push({
            title: $(li).find("a").text(),
            date: $(li).find("span.date").text(),
            slug: ((_a = $(li).find("a").attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[3]) || "",
        });
    });
    const downloads = {
        mkv: {
            d360p: [],
            d480p: [],
            d720p: [],
            d1080p: []
        },
        mp4: {
            d360p: [],
            d480p: [],
            d720p: [],
            d1080p: []
        },
        x265: {
            d360p: [],
            d480p: [],
            d720p: [],
            d1080p: []
        }
    };
    $(".download-eps").each((index, divDownload) => {
        let textFormat = ($(divDownload).find("p").text()).toLocaleLowerCase();
        let format = "mp4";
        if (textFormat.includes("mkv")) {
            format = "mkv";
        }
        else if (textFormat.includes("x265")) {
            format = "x265";
        }
        $(divDownload).find("ul > li").each((index, li) => {
            let textQuality = ($(li).find("strong").text()).toLocaleLowerCase().trim();
            let quality = "d360p";
            if (textQuality.includes("480")) {
                quality = "d480p";
            }
            else if (textQuality.includes("720") || textQuality.includes("mp4hd")) {
                quality = "d720p";
            }
            else if (textQuality.includes("1080") || textQuality.includes("fullhd")) {
                quality = "d1080p";
            }
            $(li).find("span").each((index, span) => {
                var _a;
                const link = {
                    title: $(span).find("a").text(),
                    link: $(span).find("a").attr("href") || ""
                };
                const downloadFormat = downloads[format];
                if (downloadFormat) {
                    (_a = downloadFormat[quality]) === null || _a === void 0 ? void 0 : _a.push(link);
                }
            });
        });
        downloads[format];
    });
    const iframe = [];
    $("#server > ul > li").each((index, li) => {
        iframe.push({
            title: $(li).find("div > span").text(),
            post: $(li).find("div").attr("data-post") || "",
            nume: parseInt($(li).find("div").attr("data-nume") || ""),
            type: $(li).find("div").attr("schtml"),
        });
    });
    const streaming = {
        title: $(".lm > h1.entry-title").text(),
        slug,
        image: $(".areainfo > .thumb > img").attr("src"),
        synopsis: $(".infox > .desc").text().replace(/\s+/g, ' ').trim(),
        genre,
        episode,
        downloads,
        iframe,
    };
    return res.json(streaming);
}));
app.get("/filter", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield configAxios.get("/daftar-anime-2");
    const $ = cheerio.load(response.data);
    const status = [];
    const type = [];
    const order = [];
    const genre = [];
    $(".filter_act").eq(1).find("label").each((index, label) => {
        if ($(label).find("input").attr("value") != "") {
            status.push($(label).find("input").attr("value"));
        }
    });
    $(".filter_act").eq(2).find("label").each((index, label) => {
        if ($(label).find("input").attr("value") != "") {
            type.push($(label).find("input").attr("value"));
        }
    });
    $(".filter-sort").find("li").each((index, li) => {
        order.push($(li).find("input").attr("value"));
    });
    $(".filter_act.genres").find("label").each((index, label) => {
        genre.push($(label).find("input").attr("value"));
    });
    return res.json({
        status,
        type,
        order,
        genre
    });
}));
app.get("/anime", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const animes = [];
    const page = req.query.page || 1;
    const params = {
        title: req.query.title || "",
        status: req.query.status || "",
        type: req.query.type || "",
        order: req.query.order || "",
        genre: req.query.genre || ""
    };
    const response = yield configAxios.get(`/daftar-anime-2/page/${page}`, {
        params
    });
    const $ = cheerio.load(response.data);
    $(".relat").find("article").each((index, article) => {
        const genre = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index, a) => {
            genre.push({
                title: $(a).text(),
                slug: formatSlug("genre", $(a).attr("href") || "")
            });
        });
        animes.push({
            title: $(article).find(".data > .title").text(),
            image: $(article).find(".content-thumb > img").attr("src"),
            rating: $(article).find(".score").text().trim(),
            status: $(article).find(".data > .type").text(),
            type: $(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis: $(article).find(".stooltip > .ttls").text(),
            genre,
            slug: formatSlug("anime", $(article).find("a").attr("href") || ""),
        });
    });
    return res.json(animes);
}));
app.get("/anime/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const slug = req.params.slug;
    const response = yield configAxios(`/anime/${slug}/`);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if (title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok") {
        return res.status(404).send("Anime tidak ditemukan");
    }
    const genre = [];
    $(".genre-info > a").each((index, a) => {
        genre.push({
            title: $(a).text(),
            slug: formatSlug("genre", $(a).attr("href") || "")
        });
    });
    const episode = [];
    $(".lstepsiode > ul > li").each((index, li) => {
        var _a;
        episode.push({
            title: $(li).find(".epsleft > .lchx").text(),
            date: $(li).find(".epsleft > .date").text(),
            slug: ((_a = $(li).find(".epsleft > .lchx > a").attr("href")) === null || _a === void 0 ? void 0 : _a.split("/")[3]) || "",
        });
    });
    const producers = [];
    $(".spe > span").eq(10).find("a").each((index, a) => {
        producers.push({
            title: $(a).text(),
            slug: formatSlug("producers", $(a).attr("href") || "")
        });
    });
    const anime = {
        title: $("h1.entry-title").text(),
        image: $(".infoanime > .thumb > img").attr("src"),
        slug: formatSlug("anime", (response.config.url) || ""),
        rating: $(".clearfix > span").text(),
        synopsis: $(".entry-content > p").text(),
        type: ((_a = $(".spe > span").eq(4).html()) === null || _a === void 0 ? void 0 : _a.split("\u003C/b\u003E")[1].trim()) || "",
        duration: ((_b = $(".spe > span").eq(6).html()) === null || _b === void 0 ? void 0 : _b.split("\u003C/b\u003E")[1].trim()) || "",
        season: {
            title: $(".spe > span").eq(8).find("a").text(),
            slug: formatSlug("season", $(".spe > span").eq(8).find("a").attr("href") || "")
        },
        // synopsis:$(".spe > span").eq(1).html()?.split("\u003C/b\u003E")[1].trim() || "",
        status: ((_c = $(".spe > span").eq(3).html()) === null || _c === void 0 ? void 0 : _c.split("\u003C/b\u003E")[1].trim()) || "",
        source: ((_d = $(".spe > span").eq(5).html()) === null || _d === void 0 ? void 0 : _d.split("\u003C/b\u003E")[1].trim()) || "",
        total_episode: ((_e = $(".spe > span").eq(7).html()) === null || _e === void 0 ? void 0 : _e.split("\u003C/b\u003E")[1].trim()) || "",
        studio: {
            title: $(".spe > span").eq(9).find("a").text(),
            slug: formatSlug("studio", $(".spe > span").eq(9).find("a").attr("href") || "")
        },
        released: ((_f = $(".spe > span").eq(11).html()) === null || _f === void 0 ? void 0 : _f.split("\u003C/b\u003E")[1].trim()) || "",
        trailer: $(".player-embed > iframe").attr("src") || "",
        genre,
        producers,
        episode
    };
    return res.json(anime);
}));
app.get("/iframe", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const post = String(req.query.post);
    const nume = String(req.query.nume);
    if (post === "undefined" || nume === "undefined") {
        return res.status(400).json({ msg: "post and nume is required" });
    }
    const formData = new FormData();
    formData.append("action", "player_ajax");
    formData.append("post", post);
    formData.append("nume", nume);
    formData.append("type", "schtml");
    const response = yield configAxios.post("https://samehadaku.email/wp-admin/admin-ajax.php", formData);
    const $ = cheerio.load(response.data);
    const iframe = $("iframe").attr("src");
    return res.send({ iframe });
}));
app.get("/season/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const animes = [];
    const page = req.query.page || 1;
    const slug = req.params.slug || undefined;
    const response = yield configAxios.get(`/season/${slug}/page/${page}`);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if (title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok") {
        return res.status(404).send("Season tidak ditemukan");
    }
    $(".relat").find("article").each((index, article) => {
        const genre = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index, a) => {
            genre.push({
                title: $(a).text(),
                slug: formatSlug("genre", $(a).attr("href") || "")
            });
        });
        animes.push({
            title: $(article).find(".data > .title").text(),
            image: $(article).find(".content-thumb > img").attr("src"),
            rating: $(article).find(".score").text().trim(),
            status: $(article).find(".data > .type").text(),
            type: $(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis: $(article).find(".stooltip > .ttls").text(),
            genre,
            slug: formatSlug("anime", $(article).find("a").attr("href") || ""),
        });
    });
    return res.json(animes);
}));
app.get("/genre/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const animes = [];
    const page = req.query.page || 1;
    const slug = req.params.slug || undefined;
    const response = yield configAxios.get(`/genre/${slug}/page/${page}`);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if (title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok") {
        return res.status(404).send("Genre tidak ditemukan");
    }
    $(".relat").find("article").each((index, article) => {
        const genre = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index, a) => {
            genre.push({
                title: $(a).text(),
                slug: formatSlug("genre", $(a).attr("href") || "")
            });
        });
        animes.push({
            title: $(article).find(".data > .title").text(),
            image: $(article).find(".content-thumb > img").attr("src"),
            rating: $(article).find(".score").text().trim(),
            status: $(article).find(".data > .type").text(),
            type: $(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis: $(article).find(".stooltip > .ttls").text(),
            genre,
            slug: formatSlug("anime", $(article).find("a").attr("href") || ""),
        });
    });
    return res.json(animes);
}));
app.get("/studio/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const animes = [];
    const page = req.query.page || 1;
    const slug = req.params.slug || undefined;
    const response = yield configAxios.get(`/studio/${slug}/page/${page}`);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if (title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok") {
        return res.status(404).send("Studio tidak ditemukan");
    }
    $(".relat").find("article").each((index, article) => {
        const genre = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index, a) => {
            genre.push({
                title: $(a).text(),
                slug: formatSlug("genre", $(a).attr("href") || "")
            });
        });
        animes.push({
            title: $(article).find(".data > .title").text(),
            image: $(article).find(".content-thumb > img").attr("src"),
            rating: $(article).find(".score").text().trim(),
            status: $(article).find(".data > .type").text(),
            type: $(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis: $(article).find(".stooltip > .ttls").text(),
            genre,
            slug: formatSlug("anime", $(article).find("a").attr("href") || ""),
        });
    });
    return res.json(animes);
}));
app.get("/producer/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const animes = [];
    const page = req.query.page || 1;
    const slug = req.params.slug || undefined;
    const response = yield configAxios.get(`/producers/${slug}/page/${page}`);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if (title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok") {
        return res.status(404).send("Producer tidak ditemukan");
    }
    $(".relat").find("article").each((index, article) => {
        const genre = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index, a) => {
            genre.push({
                title: $(a).text(),
                slug: formatSlug("genre", $(a).attr("href") || "")
            });
        });
        animes.push({
            title: $(article).find(".data > .title").text(),
            image: $(article).find(".content-thumb > img").attr("src"),
            rating: $(article).find(".score").text().trim(),
            status: $(article).find(".data > .type").text(),
            type: $(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis: $(article).find(".stooltip > .ttls").text(),
            genre,
            slug: formatSlug("anime", $(article).find("a").attr("href") || ""),
        });
    });
    return res.json(animes);
}));
app.listen(port, () => console.log("Server on"));
