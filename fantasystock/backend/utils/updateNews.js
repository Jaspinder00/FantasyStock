require("dotenv").config();
var request = require("request");
const News = require("../models/news");

const options = {
  url: `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${process.env.NEWS_API_KEY}`,
  headers: {
    "User-Agent": "something",
  },
};

module.exports = async () => {
  console.log("updating news...");
  // add new posts
  request(options, async (error, response, body) => {
    if (!error && response.statusCode == 200) {
      try {
        const parsedBody = JSON.parse(body);
        const goodNews = parsedBody["articles"].filter(
          (article) =>
            article.title !== null &&
            article.url !== null &&
            article.urlToImage !== null
        );

        goodNews.forEach(async (article) => {
          const exists = await News.exists({
            source: { id: article.source.id, name: article.source.name },
            author: article.author,
            title: article.title,
            description: article.description,
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt,
            content: article.content,
          });

          if (!exists) {
            News.create({
              source: { id: article.source.id, name: article.source.name },
              author: article.author,
              title: article.title,
              description: article.description,
              url: article.url,
              urlToImage: article.urlToImage,
              publishedAt: article.publishedAt,
              content: article.content,
            });
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  });

  // clean all old posts beyond 1 day
  const oneDayAgo = new Date(new Date() - 24 * 60 * 60 * 1000);

  // const allnews = await News.find({ createdAt: { $lte: oneDayAgo } });
  // console.log(allnews.length);

  await News.deleteMany({ createdAt: { $lte: oneDayAgo } });
};
