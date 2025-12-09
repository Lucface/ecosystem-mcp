/**
 * Find Alternatives Tool
 *
 * Find alternative packages to a given package.
 */
import { fetchPackageData, fetchDownloads } from "./npm-client.js";
import { fetchRepoFromNpmUrl } from "./github-client.js";
// Known alternatives mapping (curated list)
const ALTERNATIVES_MAP = {
    // Date/Time
    moment: ["date-fns", "dayjs", "luxon"],
    "date-fns": ["dayjs", "luxon", "moment"],
    dayjs: ["date-fns", "luxon", "moment"],
    // HTTP Clients
    axios: ["ky", "got", "node-fetch", "undici"],
    "node-fetch": ["undici", "axios", "ky", "got"],
    got: ["axios", "ky", "undici"],
    request: ["axios", "got", "node-fetch"],
    // State Management
    redux: ["zustand", "jotai", "recoil", "mobx", "valtio"],
    mobx: ["zustand", "redux", "jotai", "valtio"],
    zustand: ["jotai", "valtio", "redux"],
    // Validation
    joi: ["zod", "yup", "valibot", "ajv"],
    yup: ["zod", "joi", "valibot", "ajv"],
    zod: ["valibot", "yup", "joi", "ajv"],
    // Testing
    jest: ["vitest", "mocha", "ava"],
    mocha: ["vitest", "jest", "ava"],
    chai: ["vitest", "jest"],
    // Bundlers
    webpack: ["vite", "esbuild", "rollup", "parcel"],
    rollup: ["vite", "esbuild", "webpack"],
    parcel: ["vite", "webpack", "esbuild"],
    // CSS Frameworks
    bootstrap: ["tailwindcss", "bulma", "foundation"],
    tailwindcss: ["unocss", "bootstrap"],
    // ORM
    sequelize: ["prisma", "drizzle-orm", "typeorm", "knex"],
    typeorm: ["prisma", "drizzle-orm", "sequelize"],
    prisma: ["drizzle-orm", "typeorm", "sequelize"],
    // Lodash
    lodash: ["radash", "remeda", "rambda"],
    underscore: ["lodash", "radash"],
    // Express alternatives
    express: ["fastify", "koa", "hono", "hapi"],
    koa: ["fastify", "express", "hono"],
};
function getMigrationEffort(from, to) {
    // Rough estimates based on API similarity
    const lowEffort = [
        ["moment", "dayjs"],
        ["axios", "ky"],
        ["lodash", "radash"],
        ["jest", "vitest"],
    ];
    const highEffort = [
        ["redux", "zustand"],
        ["webpack", "vite"],
        ["sequelize", "prisma"],
        ["express", "fastify"],
    ];
    for (const [a, b] of lowEffort) {
        if ((from === a && to === b) || (from === b && to === a)) {
            return "low";
        }
    }
    for (const [a, b] of highEffort) {
        if ((from === a && to === b) || (from === b && to === a)) {
            return "high";
        }
    }
    return "medium";
}
function getProsAndCons(packageName) {
    const info = {
        "date-fns": {
            pros: ["Tree-shakeable", "Pure functions", "TypeScript native"],
            cons: ["More verbose than dayjs", "No chainable API"],
        },
        dayjs: {
            pros: ["Moment-compatible API", "Tiny size (2KB)", "Plugin system"],
            cons: ["Mutable by default", "Fewer locales"],
        },
        zod: {
            pros: ["TypeScript-first", "Great inference", "Active development"],
            cons: ["Runtime overhead", "Bundle size"],
        },
        valibot: {
            pros: ["Smallest bundle", "Modular design", "Fast"],
            cons: ["Newer ecosystem", "Fewer utilities"],
        },
        vitest: {
            pros: ["Vite-native", "ESM first", "Fast", "Jest compatible"],
            cons: ["Newer than Jest", "Some Jest plugins incompatible"],
        },
        zustand: {
            pros: ["Tiny (1KB)", "No boilerplate", "TypeScript native"],
            cons: ["Less ecosystem than Redux", "Different patterns"],
        },
        prisma: {
            pros: ["Type-safe queries", "Migrations", "Studio GUI"],
            cons: ["Cold starts", "Query engine overhead"],
        },
        "drizzle-orm": {
            pros: ["SQL-like syntax", "No codegen", "Edge ready", "Lightweight"],
            cons: ["Newer ecosystem", "Less documentation"],
        },
        vite: {
            pros: ["Lightning fast HMR", "ESM native", "Simple config"],
            cons: ["Different from Webpack patterns", "Some plugins incompatible"],
        },
        fastify: {
            pros: ["High performance", "Schema validation", "Plugin system"],
            cons: ["Different middleware pattern", "Learning curve from Express"],
        },
    };
    return info[packageName] || { pros: ["Popular choice"], cons: ["Evaluate fit for your use case"] };
}
export async function findAlternatives(packageName, _category) {
    // Get known alternatives
    const knownAlternatives = ALTERNATIVES_MAP[packageName.toLowerCase()] || [];
    if (knownAlternatives.length === 0) {
        return {
            original: packageName,
            alternatives: [],
            recommendation: `No curated alternatives found for "${packageName}". Consider searching npm for similar packages.`,
        };
    }
    // Fetch data for alternatives
    const alternatives = await Promise.all(knownAlternatives.slice(0, 4).map(async (altName) => {
        const [npmData, downloads] = await Promise.all([
            fetchPackageData(altName),
            fetchDownloads(altName, "last-week"),
        ]);
        if (!npmData) {
            return null;
        }
        const githubData = await fetchRepoFromNpmUrl(npmData.repository?.url);
        const { pros, cons } = getProsAndCons(altName);
        return {
            name: altName,
            description: npmData.description,
            weeklyDownloads: downloads?.downloads,
            githubStars: githubData?.stargazers_count,
            pros,
            cons,
            migrationEffort: getMigrationEffort(packageName, altName),
        };
    }));
    const validAlternatives = alternatives.filter((a) => a !== null);
    // Sort by popularity
    validAlternatives.sort((a, b) => (b.weeklyDownloads || 0) - (a.weeklyDownloads || 0));
    // Generate recommendation
    let recommendation;
    if (validAlternatives.length > 0) {
        const top = validAlternatives[0];
        const lowEffort = validAlternatives.find((a) => a.migrationEffort === "low");
        if (lowEffort && lowEffort !== top) {
            recommendation = `"${top.name}" is most popular, but "${lowEffort.name}" offers the easiest migration from "${packageName}".`;
        }
        else {
            recommendation = `Consider "${top.name}" - ${top.weeklyDownloads?.toLocaleString()} weekly downloads.`;
        }
    }
    return {
        original: packageName,
        alternatives: validAlternatives,
        recommendation,
    };
}
