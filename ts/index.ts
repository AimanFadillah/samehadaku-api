import express,{Response,Request} from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from 'cheerio';

interface Episode {
    title:string,
    image:string | undefined,
    episode:string,
    posted:string,
    date:string,
}

interface Anime {
    title:string,
    image:string | undefined,
    rating:string,
    type:string
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

app.get("/anime-list",async (req : Request,res : Response) => {
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
        animes.push({
            title:$(article).find(".data > .title").text(),
            image:$(article).find(".content-thumb > img").attr("src"),
            rating:$(article).find(".score").text().trim(),
            type:$(article).find(".data > .type").text(),
        })
    });
    return res.json(animes);
});


app.listen(port,() : void => console.log("Server on"))