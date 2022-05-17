import { extendType, objectType, nonNull, stringArg, intArg, idArg, nullable } from "nexus";
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


export const LinkQuery = extendType({ // extending root type Query and adding root field called feed
    type: "Query", // the root type being extended
    definition(t) {
        t.nonNull.list.nonNull.field("feed", { // "feed" is new root field. non nullable array of link type objects
            type: "Link", // type of objects in field
            resolve(parent, args, context, info) {
                return context.prisma.link.findMany();
            },
        });

        t.nonNull.field("link", {
            type: "Link",
            description: "A Single Link",
            args: {
                id: "Int"
            },
            resolve(parent, args, context): MaybePromise<any> {
                const link = context.prisma.link.findUnique({
                    where: {
                        id: Number(args.id)
                    }
                })
                return link
            }
        })
    },


});


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
                const newLink = context.prisma.link.create({
                    data: {
                        description: args.description,
                        url: args.url
                    },
                });
                return newLink
            },
        });
        t.nonNull.field("update", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                description: stringArg(),
                url: stringArg()
            },
            resolve(parent, args, context): MaybePromise<any> {

                const updatedLink = context.prisma.link.update({
                    where: {
                        id: Number(args.id),
                    },
                    data: {
                        description: String(args.description),
                        url: String(args.url)
                    }
                })
                return updatedLink


            }
        });
        t.nonNull.list.nonNull.field("delete", {
            type: "Link",
            args: {
                id: nonNull(intArg()),
                description: stringArg(),
                url: stringArg()
            },
            resolve(parent, args, context): MaybePromise<any> {
                const link = context.prisma.link.delete({
                    where: {
                        id: Number(args.id)
                    }
                })
                return link
            }
        })
    },
});



