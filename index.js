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
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const episodes = [];
    const page = req.query.page || 1;
    const response = yield configAxios.get(`/anime-terbaru/page/${page}`);
    console.log(cheerio);
    const $ = cheerio.load(response.data);
    $(".post-show").find("ul > li").each((index, li) => {
        episodes.push({
            title: $(li).find("h2").text(),
            image: $(li).find(".thumb > a > img").attr("src"),
            episode: $(li).find(".dtla > span").eq(0).find("author").text(),
            posted: $(li).find(".dtla > span").eq(1).find("author").text(),
            date: ($(li).find(".dtla > span").eq(2).text()).split(" Released on: ")[1],
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
app.get("/anime-list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        animes.push({
            title: $(article).find(".data > .title").text(),
            image: $(article).find(".content-thumb > img").attr("src"),
            rating: $(article).find(".score").text().trim(),
            type: $(article).find(".data > .type").text(),
        });
    });
    return res.json(animes);
}));
app.listen(port, () => console.log("Server on"));
