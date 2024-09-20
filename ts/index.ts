import express,{Response,Request, response} from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from 'cheerio';

interface Episode {
    title:string,
    date:string,
    slug:string,
    image?:string | undefined,
    episode?:string,
    posted?:string,
}

interface Anime {
    title:string,
    image:string | undefined,
    slug:string | undefined,
    rating?:string,
    type?:string,
    description?:string
    genre?:string[],
    duration?:string,
    season?:{
        title:string,
        slug:string
    },
    producers?:string,
    synopsis?:string,
    status?:string,
    source?:string,
    total_episode?:string,
    studio?:{
        title:string,
        slug:string
    },
    released?:string,
    trailer?:string,
    episode?:Episode[],
}

const app = express();
const port = 5000;
const configAxios = axios.create({
    headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    },
    baseURL:"https://samehadaku.email"
});
app.use(cors());

function formatSlug(type:string, link : string) : string {
    const href = link.match(new RegExp(`${type}\/(.*?)(\/|$)`));
    return href ? href[1] : "";
}


app.get("/",async (req : Request,res : Response) => {
    const episodes : Episode[] = [] ;
    const page = req.query.page || 1;
    const response = await configAxios.get(`/anime-terbaru/page/${page}`);
    console.log(cheerio);
    const $ = cheerio.load(response.data);
    $(".post-show").find("ul > li").each((index,li) => {
        episodes.push({
            title:$(li).find("h2").text(),
            image:$(li).find(".thumb > a > img").attr("src"),
            episode:$(li).find(".dtla > span").eq(0).find("author").text(),
            posted:$(li).find(".dtla > span").eq(1).find("author").text(),
            date:($(li).find(".dtla > span").eq(2).text()).split(" Released on: ")[1],
            slug:$(li).find("h2 > a").attr("href")?.split("/")[3] || "",
        })
    })
    return res.json(episodes);
})

app.get("/filter",async (req:Request,res:Response) => {
    const response = await configAxios.get("/daftar-anime-2");
    const $ = cheerio.load(response.data);
    const status : any[] = [];
    const type   : any[] = [];
    const order  : any[] = [];
    const genre  : any[] = [];
    $(".filter_act").eq(1).find("label").each((index,label) => {
        if($(label).find("input").attr("value") != ""){
            status.push($(label).find("input").attr("value"))
        }
    })
    $(".filter_act").eq(2).find("label").each((index,label) => {
        if($(label).find("input").attr("value") != ""){
            type.push($(label).find("input").attr("value"))
        }
    })
    $(".filter-sort").find("li").each((index,li) => {
        order.push($(li).find("input").attr("value"));
    });
    $(".filter_act.genres").find("label").each((index,label) => {
        genre.push($(label).find("input").attr("value"))
    })
    return res.json({
        status,
        type,
        order,
        genre
    })
});

app.get("/anime",async (req : Request,res : Response) => {
    const animes : Anime[] = [];
    const page = req.query.page || 1;
    const params = {
        title : req.query.title || "",
        status : req.query.status || "",
        type : req.query.type || "",
        order : req.query.order || "",
        genre : req.query.genre || ""
    }
    const response = await configAxios.get(`/daftar-anime-2/page/${page}`,{
        params
    })
    const $ = cheerio.load(response.data);
    $(".relat").find("article").each((index,article) => {
        const genre : string[] = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index,a) => {
            genre.push($(a).text());
        })
        animes.push({
            title:$(article).find(".data > .title").text(),
            image:$(article).find(".content-thumb > img").attr("src"),
            rating:$(article).find(".score").text().trim(),
            status:$(article).find(".data > .type").text(),
            type:$(article).find(".stooltip > .metadata > span").eq(1).text(),
            description:$(article).find(".stooltip > .ttls").text(),
            genre,
            slug:formatSlug("anime",$(article).find("a").attr("href") || ""),
        })
    });
    return res.json(animes);
});

app.get("/anime/:slug",async (req : Request,res : Response) => {
    const slug = req.params.slug
    const response = await configAxios(`/anime/${slug}/`)
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if(title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok"){
        return res.status(404).send("Anime tidak ditemukan");
    }
    const genre : string[] = [];
    $(".genre-info > a").each((index,a) => {
        genre.push($(a).text());
    })
    const episode : Episode[] = [];
    $(".lstepsiode > ul > li").each((index,li) => {
        episode.push({
            title:$(li).find(".epsleft > .lchx").text(),
            date:$(li).find(".epsleft > .date").text(),
            slug:$(li).find(".epsleft > .lchx > a").attr("href")?.split("/")[3] || "",
        })
    });
    const anime : Anime = {
        title:$("h1.entry-title").text(),
        image:$(".infoanime > .thumb > img").attr("src"),
        slug:formatSlug("anime",(response.config.url) || ""),
        rating:$(".clearfix > span").text(),
        description:$(".entry-content > p").text(),
        type:$(".spe > span").eq(4).html()?.split("\u003C/b\u003E")[1].trim() || "",
        duration:$(".spe > span").eq(6).html()?.split("\u003C/b\u003E")[1].trim() || "",

        season:{
            title:$(".spe > span").eq(8).find("a").text(),
            slug:formatSlug("season",$(".spe > span").eq(8).find("a").attr("href") || "")
        },

        producers:$(".spe > span").eq(10).html()?.split("\u003C/b\u003E")[1].trim() || "",
        synopsis:$(".spe > span").eq(1).html()?.split("\u003C/b\u003E")[1].trim() || "",
        status:$(".spe > span").eq(3).html()?.split("\u003C/b\u003E")[1].trim() || "",
        source:$(".spe > span").eq(5).html()?.split("\u003C/b\u003E")[1].trim() || "",
        total_episode:$(".spe > span").eq(7).html()?.split("\u003C/b\u003E")[1].trim() || "",

        studio:{
            title:$(".spe > span").eq(9).find("a").text(),
            slug:formatSlug("studio",$(".spe > span").eq(9).find("a").attr("href") || "")
        },

        released:$(".spe > span").eq(11).html()?.split("\u003C/b\u003E")[1].trim() || "",
        trailer:$(".player-embed > iframe").attr("src") || "",
        genre,
        episode
    }
    return res.json(anime);
});

app.listen(port,() : void => console.log("Server on"))