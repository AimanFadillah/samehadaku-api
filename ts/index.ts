import express,{Response,Request, response} from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from 'cheerio';

type Link = {
    title:string,
    link:string
}
type Format = "mkv" | "mp4" | "x265"
type Quality  = "d360p" | "d480p" | "d720p" | "d1080p"

interface Slug {
    title:string,
    slug:string,
}

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
    genre?:Slug[],
    duration?:string,
    season?:Slug,
    producers?:Slug[],
    synopsis?:string,
    status?:string,
    source?:string,
    total_episode?:string,
    studio?:Slug,
    released?:string,
    trailer?:string,
    episode?:Episode[],
}

interface Download {
    d360p?:Link[],
    d480p?:Link[],
    d720p?:Link[],
    d1080p?:Link[],
}

interface FormatDownload {
    mkv?:Download,
    mp4?:Download,
    x265?:Download,
}

interface Iframe {
    title:string,
    post:string,
    nume:number,
    type?:string
}

interface Streaming extends Anime {
    iframe:Iframe[],
    downloads?:FormatDownload,
}

const app = express();
const port = 5000;
const configAxios = axios.create({
    headers:{
        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        "Origin" : "https://samehadaku.email",
        "Accept" : "*/*",
        "Accept-Encoding" : "gzip, deflate, br",
        "Connection" : "keep-alive",
        "Cookie" : "HstCfa4389157=1727665703613; HstCla4389157=1727665713029; HstCmu4389157=1727665703613; HstCns4389157=1; HstCnv4389157=1; HstPn4389157=2; HstPt4389157=2; __dtsu=1040172766570420C24F120BE74D0990; _cc_dc=2; _cc_id=4cdf4248077ed14829b71e061b0177b6; _ga=GA1.1.879228956.1727665704; _ga_85V0GD905H=GS1.1.1727664174.15.1.1727665713.0.0.0; _gat_gtag_UA_162751770_1=1; _gid=GA1.2.464297741.1727665704; cookie=49454673c9e757ca; df=1727665704; done_redirects147=1; done_redirects219=1; done_redirects252=1; l=1040172766570420C24F120BE74D0990; m=2; uid=1040172766570420C24F120BE74D0990;"
    },
    withCredentials:true,
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

app.get("/episode",async (req:Request,res:Response) => {
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
});

app.get("/episode/:slug/",async (req:Request,res:Response) => {
    const slug = req.params.slug;
    const response = await configAxios.get(`https://samehadaku.email/${slug}/`);
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if(
        title === "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok" ||
        title === "Anime Terbaru - Samehadaku" ||
        title === "Daftar Anime - Samehadaku" ||
        title === "Jadwal Rilis - Samehadaku" ||
        slug === "anime" ||
        slug === "producers" ||
        slug === "studio" ||
        slug === "season" ||
        slug === "genre" ||
        slug === "jadwal-rilis"
    ){
        return res.status(404).send("Episode tidak ditemukan");
    }
    const genre : Slug[] = []
    $(".genre-info > a").each((index,a) => {
        genre.push({
            title:$(a).text(),
            slug:formatSlug("genre",$(a).attr("href") || "")
        })
    })
    const episode : Episode[] = []
    $(".lstepsiode > ul > li").each((index,li) => {
        episode.push({
            title:$(li).find("a").text(),
            date:$(li).find("span.date").text(),
            slug:$(li).find("a").attr("href")?.split("/")[3] || "",
        })
    })
    const downloads : FormatDownload = {
        mkv:{
            d360p:[],
            d480p:[],
            d720p:[],
            d1080p:[]
        },
        mp4:{
            d360p:[],
            d480p:[],
            d720p:[],
            d1080p:[]
        },
        x265:{
            d360p:[],
            d480p:[],
            d720p:[],
            d1080p:[]
        }
    };
    $(".download-eps").each((index,divDownload) => {
        let textFormat : string = ($(divDownload).find("p").text()).toLocaleLowerCase();
        let format : Format = "mp4"
        if(textFormat.includes("mkv")){
            format = "mkv"
        }else if (textFormat.includes("x265")){
            format = "x265"
        }
        $(divDownload).find("ul > li").each((index,li) => {
            let textQuality : string = ($(li).find("strong").text()).toLocaleLowerCase().trim();
            let quality : Quality = "d360p";
            if(textQuality.includes("480")){
                quality = "d480p"
            }else if(textQuality.includes("720") || textQuality.includes("mp4hd")){
                quality = "d720p"
            }else if(textQuality.includes("1080") || textQuality.includes("fullhd")){
                quality = "d1080p"
            }
            $(li).find("span").each((index,span) => {
                const link : Link = {
                    title:$(span).find("a").text(),
                    link:$(span).find("a").attr("href") || ""
                }
                const downloadFormat = downloads[format];
                if(downloadFormat){
                    downloadFormat[quality]?.push(link);
                }
            })  
        });

        downloads[format]
    })
    const iframe : Iframe[]  = []
    $("#server > ul > li").each((index,li) => {
        iframe.push({
            title:$(li).find("div > span").text(),
            post:$(li).find("div").attr("data-post") || "",
            nume:parseInt($(li).find("div").attr("data-nume") || ""),
            type:$(li).find("div").attr("schtml"),
        })
    })
    const streaming : Streaming = {
        title:$(".lm > h1.entry-title").text(),
        slug,
        image:$(".areainfo > .thumb > img").attr("src"),
        synopsis:$(".infox > .desc").text().replace(/\s+/g, ' ').trim(),
        genre,
        episode,
        downloads,
        iframe,
    }

    return res.json(streaming);
});

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
    try{
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
        const genre : Slug[] = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index,a) => {
            genre.push({
               title:$(a).text(),
               slug:formatSlug("genre",$(a).attr("href") || "")
            });
        })
        animes.push({
            title:$(article).find(".data > .title").text(),
            image:$(article).find(".content-thumb > img").attr("src"),
            rating:$(article).find(".score").text().trim(),
            status:$(article).find(".data > .type").text(),
            type:$(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis:$(article).find(".stooltip > .ttls").text(),
            genre,
            slug:formatSlug("anime",$(article).find("a").attr("href") || ""),
        })
    });
    return res.json(animes);
    }catch(e){
        return res.json(e);
    }
});

app.get("/anime/:slug",async (req : Request,res : Response) => {
    const slug = req.params.slug
    const response = await configAxios(`/anime/${slug}/`)
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if(title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok"){
        return res.status(404).send("Anime tidak ditemukan");
    }
    const genre : Slug[] = [];
    $(".genre-info > a").each((index,a) => {
        genre.push({
            title:$(a).text(),
            slug:formatSlug("genre",$(a).attr("href") || "")
        });    
    })
    const episode : Episode[] = [];
    $(".lstepsiode > ul > li").each((index,li) => {
        episode.push({
            title:$(li).find(".epsleft > .lchx").text(),
            date:$(li).find(".epsleft > .date").text(),
            slug:$(li).find(".epsleft > .lchx > a").attr("href")?.split("/")[3] || "",
        })
    });
    const producers : Slug[] = [];
    $(".spe > span").eq(10).find("a").each((index,a) => {
        producers.push({
            title:$(a).text(),
            slug:formatSlug("producers",$(a).attr("href") || "")
        })
    })
    const anime : Anime = {
        title:$("h1.entry-title").text(),
        image:$(".infoanime > .thumb > img").attr("src"),
        slug:formatSlug("anime",(response.config.url) || ""),
        rating:$(".clearfix > span").text(),
        synopsis:$(".entry-content > p").text(),
        type:$(".spe > span").eq(4).html()?.split("\u003C/b\u003E")[1].trim() || "",
        duration:$(".spe > span").eq(6).html()?.split("\u003C/b\u003E")[1].trim() || "",

        season:{
            title:$(".spe > span").eq(8).find("a").text(),
            slug:formatSlug("season",$(".spe > span").eq(8).find("a").attr("href") || "")
        },
        // synopsis:$(".spe > span").eq(1).html()?.split("\u003C/b\u003E")[1].trim() || "",
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
        producers,
        episode
    }
    return res.json(anime);
});

app.get("/iframe",async (req:Request,res:Response) => {
    const post = String(req.query.post);
    const nume = String(req.query.nume);
    if(post === "undefined" || nume === "undefined"){
        return res.status(400).json({msg:"post and nume is required"});
    }
    const formData = new FormData();
    formData.append("action","player_ajax");
    formData.append("post",post);
    formData.append("nume",nume);
    formData.append("type","schtml");
    const response = await configAxios.post("https://samehadaku.email/wp-admin/admin-ajax.php",formData);
    const $ = cheerio.load(response.data);
    const iframe = $("iframe").attr("src");
    return res.send({iframe});
});

app.get("/season/:slug",async (req : Request,res : Response) => {
    const animes : Anime[] = [];
    const page = req.query.page || 1;
    const slug = req.params.slug || undefined;
    const response = await configAxios.get(`/season/${slug}/page/${page}`)
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if(title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok"){
        return res.status(404).send("Season tidak ditemukan");
    }
    $(".relat").find("article").each((index,article) => {
        const genre : Slug[] = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index,a) => {
            genre.push({
               title:$(a).text(),
               slug:formatSlug("genre",$(a).attr("href") || "")
            });
        })
        animes.push({
            title:$(article).find(".data > .title").text(),
            image:$(article).find(".content-thumb > img").attr("src"),
            rating:$(article).find(".score").text().trim(),
            status:$(article).find(".data > .type").text(),
            type:$(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis:$(article).find(".stooltip > .ttls").text(),
            genre,
            slug:formatSlug("anime",$(article).find("a").attr("href") || ""),
        })
    });
    return res.json(animes);
});

app.get("/genre/:slug",async (req : Request,res : Response) => {
    const animes : Anime[] = [];
    const page = req.query.page || 1;
    const slug = req.params.slug || undefined;
    const response = await configAxios.get(`/genre/${slug}/page/${page}`)
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if(title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok"){
        return res.status(404).send("Genre tidak ditemukan");
    }
    $(".relat").find("article").each((index,article) => {
        const genre : Slug[] = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index,a) => {
            genre.push({
               title:$(a).text(),
               slug:formatSlug("genre",$(a).attr("href") || "")
            });
        })
        animes.push({
            title:$(article).find(".data > .title").text(),
            image:$(article).find(".content-thumb > img").attr("src"),
            rating:$(article).find(".score").text().trim(),
            status:$(article).find(".data > .type").text(),
            type:$(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis:$(article).find(".stooltip > .ttls").text(),
            genre,
            slug:formatSlug("anime",$(article).find("a").attr("href") || ""),
        })
    });
    return res.json(animes);
});

app.get("/studio/:slug",async (req : Request,res : Response) => {
    const animes : Anime[] = [];
    const page = req.query.page || 1;
    const slug = req.params.slug || undefined;
    const response = await configAxios.get(`/studio/${slug}/page/${page}`)
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if(title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok"){
        return res.status(404).send("Studio tidak ditemukan");
    }
    $(".relat").find("article").each((index,article) => {
        const genre : Slug[] = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index,a) => {
            genre.push({
               title:$(a).text(),
               slug:formatSlug("genre",$(a).attr("href") || "")
            });
        })
        animes.push({
            title:$(article).find(".data > .title").text(),
            image:$(article).find(".content-thumb > img").attr("src"),
            rating:$(article).find(".score").text().trim(),
            status:$(article).find(".data > .type").text(),
            type:$(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis:$(article).find(".stooltip > .ttls").text(),
            genre,
            slug:formatSlug("anime",$(article).find("a").attr("href") || ""),
        })
    });
    return res.json(animes);
});

app.get("/producer/:slug",async (req : Request,res : Response) => {
    const animes : Anime[] = [];
    const page = req.query.page || 1;
    const slug = req.params.slug || undefined;
    const response = await configAxios.get(`/producers/${slug}/page/${page}`)
    const $ = cheerio.load(response.data);
    const title = $("title").text();
    if(title == "samehadaku.care | Instagram, Facebook, TikTok | LinktreeFacebookInstagramGoogle Play StoreTikTok"){
        return res.status(404).send("Producer tidak ditemukan");
    }
    $(".relat").find("article").each((index,article) => {
        const genre : Slug[] = [];
        $(article).find(".stooltip > .genres > .mta > a").each((index,a) => {
            genre.push({
               title:$(a).text(),
               slug:formatSlug("genre",$(a).attr("href") || "")
            });
        })
        animes.push({
            title:$(article).find(".data > .title").text(),
            image:$(article).find(".content-thumb > img").attr("src"),
            rating:$(article).find(".score").text().trim(),
            status:$(article).find(".data > .type").text(),
            type:$(article).find(".stooltip > .metadata > span").eq(1).text(),
            synopsis:$(article).find(".stooltip > .ttls").text(),
            genre,
            slug:formatSlug("anime",$(article).find("a").attr("href") || ""),
        })
    });
    return res.json(animes);
});



app.listen(port,() : void => console.log("Server on"))