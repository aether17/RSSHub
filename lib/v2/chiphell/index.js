const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseURL = 'https://www.chiphell.com/';
    const response = await got({
        method: 'get',
        url: baseURL,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // const articles = $('ul#threadulid section li').map((id, item) => $('a:first', item).attr('href')).toArray();
    // const feeds = await Promise.all(
    //     articles.map(async (item) => {
    //         const feedURL = baseURL + item;
    //         const cache = await ctx.cache.get(feedURL);
    //         if (cache) {
    //             return Promise.resolve(JSON.parse(cache));
    //         }

    //         const resp = await got({
    //             method: 'get',
    //             url: feedURL,
    //         });
    //         const $ = cheerio.load(resp.data);
    //         const data = $('div[class*=pcb]').html();

    //         const single = {
    //             title: $('span#thread_subject').text(),
    //             description: data,
    //             pubDate: parseDate($('em:first', $('div.authi').eq(1)).text().slice(4)),
    //             link: feedURL,
    //             author: $('div.authi:first').text().trim(),
    //         };
    //         ctx.cache.set(feedURL, JSON.stringify(single));
    //         return Promise.resolve(single);
    //     })
    // );

    const feeds = $('ul#threadulid section li')
        .map((i, item) => {
            const feed = $(item);
            const single = {
                title: $('div:first a', feed).text().trim(),
                category: $('div.avart div:last a:last', feed).text(),
                pubDate: parseDate($('div.avart div:last span:first', feed).text()),
                link: baseURL + ('a', feed).attr('href'),
                author: $('div.avart div:first a', feed).text(),
                description: art(path.join(__dirname, 'templates/chiphell-post.art'), {
                    cover: $('a:first img', feed).attr('src'),
                    desc: $('div:last', feed).text().trim(),
                }),
            };
            return single;
        })
        .toArray();

    ctx.state.data = {
        title: 'Chiphell latest',
        link: baseURL,
        description: 'Latest articles of chiphell',
        item: feeds,
    };
};
