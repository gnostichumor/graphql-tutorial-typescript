import { makeSchema } from 'nexus';
import { join } from 'path';
import * as types from "./graphql";

export const schema = makeSchema({
    types,
    outputs: {
        schema: join(process.cwd(), "schema.graphql"),
        typegen: join(process.cwd(), "nexus-typegen.ts"),
    },
    contextType: {
        module: join(process.cwd(), "./src/context.ts"), //1
        export: "Context", //2
    }
})

// 1: Path to the file (also sometimes called a module) where the context interface (or type) is exported.
// 2: Name of the exported interface in that module.