import { extendType, objectType, inputObjectType, nonNull, stringArg, intArg, enumType, arg, list } from "nexus";
import { MaybePromise } from "nexus/dist/core";
import { Prisma } from "@prisma/client"

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});

export const Link = objectType({
    name: "Link", // defines name of type
    definition(t) { // inside definition, add diff fields to type
        t.nonNull.int("id"); // type Int named Id
        t.nonNull.string("description"); // type String name description
        t.nonNull.dateTime("createdAt");
        t.nonNull.string("url"); // type String name url
        t.field("postedBy", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .voters();
            }
        });

    },
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links", { type: "Link" });
        t.nonNull.int("count");
        t.id("id");
    },
});


export const LinkQuery = extendType({ // extending root type Query and adding root field called feed
    type: "Query", // the root type being extended
    definition(t) {
        t.nonNull.field("feed", { // "feed" is new root field. non nullable array of link type objects
            type: "Feed", // type of objects in field
            args: {
                filter: stringArg(),
                skip: intArg(),
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),
            },
            async resolve(parent, args, context) {
                const where = args.filter
                    ? {
                        OR: [
                            { description: { contains: args.filter } },
                            { url: { contains: args.filter } }
                        ],
                    }
                    : {};

                const links = await context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as
                        | Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput>
                        | undefined,
                });

                const count = await context.prisma.link.count({ where });
                const id = `main-feed:${JSON.stringify(args)}`;

                return {
                    links,
                    count,
                    id,
                };
            },
        });

        t.nonNull.field("link", {
            type: "Link",
            description: "A Single Link",
            args: {
                id: "Int"
            },
            async resolve(parent, args, context): Promise<any> {
                const link = await context.prisma.link.findUnique({
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
                const { description, url } = args;
                const { userId } = context;

                if (!userId) {
                    throw new Error("Cannot post without logging in")
                }

                const newLink = context.prisma.link.create({
                    data: {
                        description: args.description,
                        url: args.url,
                        postedBy: { connect: { id: userId } }
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



