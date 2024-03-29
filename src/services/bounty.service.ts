import axios from 'axios';
import { load } from 'cheerio';

export interface Question {
    title: string;
    link: string;
    bounty: number
    votes: number
    hasAnyAnswers: boolean
    tags: string[]
}

function parseBody(body: any, take: number): Question[] {

    if (take > 50)
        take = 50;

    if (take == 0)
        take = 5;

    const $ = load(body)

    let bounties: Question[] = [];

    $("#questions > div").each(function () {

        const statsParent = $(this).find(".s-post-summary--stats .s-post-summary--stats-item");
        const tagsParent = $(this).find(".s-post-summary--content .s-post-summary--meta").find(".s-post-summary--meta-tags a");
        let tags: string[] = [];

        tagsParent.each((index, el) => {
            tags.push($(el).text())
        });

        const hasAnyAnswers = Number(statsParent.find(":nth-child(2) span:nth-child(1)").text()) > 0;

        const question: Question = {
            title: $(this).find("h3 a").text(),
            link: $(this).find("h3 a").attr('href') ?? "",

            bounty: Number($(this).find("div .has-bounty")
                .text().replace('+', '')),
            votes: Number(statsParent.find(":nth-child(1) span:nth-child(1)").text()),

            hasAnyAnswers: hasAnyAnswers,
            tags: tags
        };

        bounties.push(question);
    });

    return bounties.slice(0, take);
}

export async function getBounties(take: number): Promise<Question[]> {
    return axios({
        method: 'GET',
        url: 'https://stackoverflow.com/questions?sort=Newest&filters=Bounty&edited=true'
    })
        .then((response) => {
            return parseBody(response.data, take);;
        })
        .catch((err) => {
            console.log(err)
            return [];
        });
}