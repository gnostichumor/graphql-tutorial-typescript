import { argsToArgsConfig } from "graphql/type/definition";
import { extendType, objectType, nonNull, stringArg, intArg, idArg } from "nexus";
import { MaybePromise } from "nexus/dist/core";
import { resolveImportPath } from "nexus/dist/utils";
import { NexusGenObjects } from "../../nexus-typegen";

export const Link = objectType({
    name: "Link", // defines name of type
    definition(t) { // inside definition, add diff fields to type
        t.nonNull.int("id"); // type Int named Id
        t.nonNull.string("description"); // type String name description
        t.nonNull.string("url"); // type String name url
    },
});

let links: NexusGenObjects["Link"][] = [ // defines links as list of Link objects
    {
        id: 1,
        url: "www.howtographql.com",
        description: "Fullstack tutorial for GraphQL"
    },
    {
        id: 2,
        url: "graphql.org",
        description: "GraphQL official website",
    },
];

export const LinkQuery = extendType({ // extending root type Query and adding root field called feed
    type: "Query", // the root type being extended
    definition(t) {
        t.nonNull.list.nonNull.field("feed", { // "feed" is new root field. non nullable array of link type objects
            type: "Link", // type of objects in field
            resolve(parent, args, context, info) {
                return links;
            },
        });
    },
});

export const SingleLinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.field("link", {
            type: "Link",
            description: "A Single Link",
            args: {
                id: "Int"
            },
            resolve(parent, args): MaybePromise<any> {
                return links.find(link => link.id === args.id)
            }
        })
    }
})

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field("post", {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },

            resolve(parent, args, context) {
                const { description, url } = args;

                let idCount = links.length + 1;
                const link = {
                    id: idCount,
                    description: description,
                    url: url,
                };
                links.push(link);
                return link;
            },
        });
    },
});


