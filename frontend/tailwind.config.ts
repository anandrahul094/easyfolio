import type {Config} from "tailwindcss";

const config:Config={content:["./app/**/*.{js,ts,jsx,tsx,mdx}"],theme:{extend:{colors:{night:"#0B1023",panel:"#151C37",violet:"#8B6CFF",lilac:"#C2B5FF",emerald:"#34D399",crimson:"#FB7185"},boxShadow:{glow:"0 20px 70px rgba(106,83,255,.18)",glass:"0 18px 60px rgba(2,6,23,.26)"},borderRadius:{"4xl":"2rem"}}},plugins:[]};
export default config;
