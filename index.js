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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
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
            genre.push($(a).text());
        });
        animes.push({
            title: $(article).find(".data > .title").text(),
            image: $(article).find(".content-thumb > img").attr("src"),
            rating: $(article).find(".score").text().trim(),
            status: $(article).find(".data > .type").text(),
            type: $(article).find(".stooltip > .metadata > span").eq(1).text(),
            description: $(article).find(".stooltip > .ttls").text(),
            genre,
            slug: formatSlug("anime", $(article).find("a").attr("href") || ""),
        });
    });
    return res.json(animes);
}));
app.get("/anime/:slug", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const slug = req.params.slug;
    const response = yield configAxios(`/anime/${slug}/`);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if (title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok") {
        return res.status(404).send("Anime tidak ditemukan");
    }
    const genre = [];
    $(".genre-info > a").each((index, a) => {
        genre.push($(a).text());
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
    const anime = {
        title: $("h1.entry-title").text(),
        image: $(".infoanime > .thumb > img").attr("src"),
        slug: formatSlug("anime", (response.config.url) || ""),
        rating: $(".clearfix > span").text(),
        description: $(".entry-content > p").text(),
        type: ((_a = $(".spe > span").eq(4).html()) === null || _a === void 0 ? void 0 : _a.split("\u003C/b\u003E")[1].trim()) || "",
        duration: ((_b = $(".spe > span").eq(6).html()) === null || _b === void 0 ? void 0 : _b.split("\u003C/b\u003E")[1].trim()) || "",
        season: {
            title: $(".spe > span").eq(8).find("a").text(),
            slug: formatSlug("season", $(".spe > span").eq(8).find("a").attr("href") || "")
        },
        producers: ((_c = $(".spe > span").eq(10).html()) === null || _c === void 0 ? void 0 : _c.split("\u003C/b\u003E")[1].trim()) || "",
        synopsis: ((_d = $(".spe > span").eq(1).html()) === null || _d === void 0 ? void 0 : _d.split("\u003C/b\u003E")[1].trim()) || "",
        status: ((_e = $(".spe > span").eq(3).html()) === null || _e === void 0 ? void 0 : _e.split("\u003C/b\u003E")[1].trim()) || "",
        source: ((_f = $(".spe > span").eq(5).html()) === null || _f === void 0 ? void 0 : _f.split("\u003C/b\u003E")[1].trim()) || "",
        total_episode: ((_g = $(".spe > span").eq(7).html()) === null || _g === void 0 ? void 0 : _g.split("\u003C/b\u003E")[1].trim()) || "",
        studio: {
            title: $(".spe > span").eq(9).find("a").text(),
            slug: formatSlug("studio", $(".spe > span").eq(9).find("a").attr("href") || "")
        },
        released: ((_h = $(".spe > span").eq(11).html()) === null || _h === void 0 ? void 0 : _h.split("\u003C/b\u003E")[1].trim()) || "",
        trailer: $(".player-embed > iframe").attr("src") || "",
        genre,
        episode
    };
    return res.json(anime);
}));
app.listen(port, () => console.log("Server on"));