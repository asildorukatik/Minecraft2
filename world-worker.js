'use strict';

const DEFAULT_W=48,WORLD_H=200,DEFAULT_D=48,WATER_LEVEL=112,CHUNK_SIZE=16,DEEPSLATE_LEVEL=100,ORE_FLOOR=10,NETHER_ROOF_Y=95;
const BLOCK=Object.freeze({
  AIR:0,GRASS:1,DIRT:2,STONE:3,SAND:4,WOOD:5,LEAVES:6,WATER:7,BRICK:8,GOLD_BLOCK:9,
  COBBLESTONE:10,MOSSY_COBBLESTONE:11,STONE_BRICK:12,BEDROCK:13,OBSIDIAN:14,CLAY:15,
  SANDSTONE:16,GRAVEL:17,PLANKS:18,BOOKSHELF:19,IRON_BLOCK:20,DIAMOND_BLOCK:21,
  COAL_BLOCK:22,EMERALD_BLOCK:23,REDSTONE_BLOCK:24,GOLD_ORE:25,IRON_ORE:26,COAL_ORE:27,
  DIAMOND_ORE:28,CRAFTING_TABLE:29,FURNACE:30,GLASS:31,DOOR:32,
  GRANITE:33,POLISHED_GRANITE:34,DIORITE:35,POLISHED_DIORITE:36,ANDESITE:37,POLISHED_ANDESITE:38,
  CRACKED_STONE_BRICKS:39,CHISELED_STONE_BRICKS:40,SPRUCE_PLANKS:41,BIRCH_PLANKS:42,JUNGLE_PLANKS:43,
  ACACIA_PLANKS:44,DARK_OAK_PLANKS:45,SPRUCE_LOG:46,BIRCH_LOG:47,JUNGLE_LOG:48,ACACIA_LOG:49,DARK_OAK_LOG:50,
  LAPIS_BLOCK:51,LAPIS_ORE:52,REDSTONE_ORE:53,EMERALD_ORE:54,NETHER_QUARTZ_ORE:55,TNT:56,COBWEB:57,
  SPONGE:58,ICE:59,CACTUS:60,PUMPKIN:61,JACK_O_LANTERN:62,NETHERRACK:63,SOUL_SAND:64,GLOWSTONE:65,
  NETHER_BRICKS:66,END_STONE:67,WHITE_WOOL:68,ORANGE_WOOL:69,MAGENTA_WOOL:70,LIGHT_BLUE_WOOL:71,
  YELLOW_WOOL:72,LIME_WOOL:73,PINK_WOOL:74,GRAY_WOOL:75,LIGHT_GRAY_WOOL:76,CYAN_WOOL:77,PURPLE_WOOL:78,
  BLUE_WOOL:79,BROWN_WOOL:80,GREEN_WOOL:81,RED_WOOL:82,BLACK_WOOL:83,SNOW_BLOCK:84,PACKED_ICE:85,QUARTZ_BLOCK:86,MORGANITE_ORE:87,
  WATER_FLOW_1:88,WATER_FLOW_2:89,WATER_FLOW_3:90,WATER_FLOW_4:91,WATER_FLOW_5:92,LAVA_FLOW_1:93,LAVA_FLOW_2:94,LAVA_FLOW_3:95,LAVA_FLOW_4:96,LAVA_FLOW_5:97,BED:98,POWERED_RAIL:184,REDSTONE_TORCH:185,
  LAVA:200,FIRE:201,NETHER_PORTAL:202,END_PORTAL:203,END_PORTAL_FRAME:204,CHEST:205,REDSTONE_WIRE:206,
  PISTON:207,STICKY_PISTON:208,PISTON_HEAD:209,LEVER:210,STONE_BUTTON:211,STONE_PRESSURE_PLATE:212,
  REPEATER:213,REDSTONE_LAMP:214,LIT_REDSTONE_LAMP:215,COMMAND_BLOCK:216,REPEATING_COMMAND_BLOCK:217,
  CHAIN_COMMAND_BLOCK:218,PRISMARINE:219,PRISMARINE_BRICKS:220,DARK_PRISMARINE:221,SEA_LANTERN:222,
  BLACKSTONE:223,POLISHED_BLACKSTONE_BRICKS:224,PURPUR_BLOCK:225,PURPUR_PILLAR:226,END_STONE_BRICKS:227,
  CHORUS_PLANT:228,CHORUS_FLOWER:229,RAIL:230,PAINTING:231,ITEM_FRAME:232,MAGMA_BLOCK:233,NETHER_GOLD_ORE:234,
  ANCIENT_DEBRIS:235,CRYING_OBSIDIAN:236,BASALT:237,POLISHED_BASALT:238,END_GATEWAY:239,COPPER_BLOCK:240,DEEPSLATE:241,
  AMETHYST_BLOCK:242,OAK_SAPLING:243,TORCH:244,LADDER:245,ENCHANTING_TABLE:246,ANVIL:247,BEACON:248,
  HAY_BALE:249,BELL:250,BARREL:251,OAK_FENCE:252,GRASS_PATH:253,MYCELIUM:254,SLIME_BLOCK:255
});
const TILES=new Map([
  [BLOCK.GRASS,{top:[2,0],side:[3,0],bottom:[13,1]}],[BLOCK.DIRT,{all:[13,1]}],[BLOCK.STONE,{all:[19,0]}],
  [BLOCK.GRANITE,{all:[20,0]}],[BLOCK.POLISHED_GRANITE,{all:[21,0]}],[BLOCK.DIORITE,{all:[22,0]}],[BLOCK.POLISHED_DIORITE,{all:[23,0]}],[BLOCK.ANDESITE,{all:[24,0]}],[BLOCK.POLISHED_ANDESITE,{all:[25,0]}],
  [BLOCK.COBBLESTONE,{all:[26,0]}],[BLOCK.MOSSY_COBBLESTONE,{all:[27,0]}],[BLOCK.STONE_BRICK,{all:[28,0]}],
  [BLOCK.CRACKED_STONE_BRICKS,{all:[30,0]}],[BLOCK.CHISELED_STONE_BRICKS,{all:[31,0]}],
  [BLOCK.BEDROCK,{all:[0,1]}],[BLOCK.OBSIDIAN,{all:[1,1]}],[BLOCK.CLAY,{all:[2,1]}],[BLOCK.SAND,{all:[3,1]}],
  [BLOCK.SANDSTONE,{all:[5,1]}],[BLOCK.GRAVEL,{all:[10,1]}],[BLOCK.PLANKS,{all:[14,1]}],[BLOCK.SPRUCE_PLANKS,{all:[15,1]}],[BLOCK.BIRCH_PLANKS,{all:[16,1]}],[BLOCK.JUNGLE_PLANKS,{all:[17,1]}],[BLOCK.ACACIA_PLANKS,{all:[18,1]}],[BLOCK.DARK_OAK_PLANKS,{all:[19,1]}],[BLOCK.BRICK,{all:[22,1]}],
  [BLOCK.BOOKSHELF,{all:[26,1]}],[BLOCK.TNT,{top:[24,1],side:[23,1],bottom:[25,1]}],[BLOCK.COBWEB,{all:[27,1],cutout:true}],[BLOCK.WOOD,{top:[29,2],side:[28,2],bottom:[29,2]}],[BLOCK.SPRUCE_LOG,{top:[31,2],side:[30,2],bottom:[31,2]}],[BLOCK.BIRCH_LOG,{top:[1,3],side:[0,3],bottom:[1,3]}],[BLOCK.JUNGLE_LOG,{top:[3,3],side:[2,3],bottom:[3,3]}],[BLOCK.ACACIA_LOG,{top:[5,3],side:[4,3],bottom:[5,3]}],[BLOCK.DARK_OAK_LOG,{top:[7,3],side:[6,3],bottom:[7,3]}],[BLOCK.IRON_BLOCK,{all:[8,3]}],
  [BLOCK.GOLD_BLOCK,{all:[9,3]}],[BLOCK.DIAMOND_BLOCK,{all:[10,3]}],[BLOCK.COAL_BLOCK,{all:[11,3]}],
  [BLOCK.LAPIS_BLOCK,{all:[12,3]}],[BLOCK.EMERALD_BLOCK,{all:[13,3]}],[BLOCK.REDSTONE_BLOCK,{all:[14,3]}],[BLOCK.QUARTZ_BLOCK,{top:[0,15],side:[15,3],bottom:[1,15]}],[BLOCK.MORGANITE_ORE,{all:[2,15]}],[BLOCK.GOLD_ORE,{all:[24,3]}],
  [BLOCK.IRON_ORE,{all:[25,3]}],[BLOCK.COAL_ORE,{all:[26,3]}],[BLOCK.LAPIS_ORE,{all:[27,3]}],[BLOCK.DIAMOND_ORE,{all:[28,3]}],[BLOCK.REDSTONE_ORE,{all:[29,3]}],[BLOCK.EMERALD_ORE,{all:[30,3]}],[BLOCK.NETHER_QUARTZ_ORE,{all:[31,3]}],
  [BLOCK.CRAFTING_TABLE,{top:[5,4],side:[6,4],bottom:[14,1]}],[BLOCK.FURNACE,{top:[10,4],side:[10,4],bottom:[10,4],front:[8,4]}],
  [BLOCK.GLASS,{all:[17,4],cutout:true}],[BLOCK.SPONGE,{all:[16,4]}],[BLOCK.LEAVES,{all:[22,4],cutout:true}],[BLOCK.SNOW_BLOCK,{all:[5,5]}],[BLOCK.ICE,{all:[6,5],cutout:true}],[BLOCK.PACKED_ICE,{all:[7,5]}],[BLOCK.CACTUS,{top:[10,5],side:[9,5],bottom:[10,5]}],[BLOCK.DOOR,{lower:[17,10],upper:[18,10],all:[17,10],cutout:true,entityOnly:true}],
  [BLOCK.PUMPKIN,{top:[9,6],side:[10,6],bottom:[9,6]}],[BLOCK.JACK_O_LANTERN,{top:[9,6],side:[12,6],bottom:[9,6]}],[BLOCK.NETHERRACK,{all:[13,6]}],[BLOCK.NETHER_BRICKS,{all:[14,6]}],[BLOCK.SOUL_SAND,{all:[18,6]}],[BLOCK.GLOWSTONE,{all:[19,6]}],[BLOCK.END_STONE,{all:[22,10]}],
  [BLOCK.BED,{all:[6,10],entityOnly:true}],[BLOCK.WHITE_WOOL,{all:[24,9]}],[BLOCK.ORANGE_WOOL,{all:[25,9]}],[BLOCK.MAGENTA_WOOL,{all:[26,9]}],[BLOCK.LIGHT_BLUE_WOOL,{all:[27,9]}],[BLOCK.YELLOW_WOOL,{all:[28,9]}],[BLOCK.LIME_WOOL,{all:[29,9]}],[BLOCK.PINK_WOOL,{all:[30,9]}],[BLOCK.GRAY_WOOL,{all:[31,9]}],[BLOCK.LIGHT_GRAY_WOOL,{all:[0,10]}],[BLOCK.CYAN_WOOL,{all:[1,10]}],[BLOCK.PURPLE_WOOL,{all:[2,10]}],[BLOCK.BLUE_WOOL,{all:[3,10]}],[BLOCK.BROWN_WOOL,{all:[4,10]}],[BLOCK.GREEN_WOOL,{all:[5,10]}],[BLOCK.RED_WOOL,{all:[6,10]}],[BLOCK.BLACK_WOOL,{all:[7,10]}],
  [BLOCK.WATER,{all:[0,12],fluid:true}],[BLOCK.WATER_FLOW_1,{all:[0,12],fluid:true,flowStage:1}],[BLOCK.WATER_FLOW_2,{all:[0,12],fluid:true,flowStage:2}],[BLOCK.WATER_FLOW_3,{all:[0,12],fluid:true,flowStage:3}],[BLOCK.WATER_FLOW_4,{all:[0,12],fluid:true,flowStage:4}],[BLOCK.WATER_FLOW_5,{all:[0,12],fluid:true,flowStage:5}],[BLOCK.LAVA,{all:[1,12],fluid:true}],[BLOCK.LAVA_FLOW_1,{all:[1,12],fluid:true,flowStage:1}],[BLOCK.LAVA_FLOW_2,{all:[1,12],fluid:true,flowStage:2}],[BLOCK.LAVA_FLOW_3,{all:[1,12],fluid:true,flowStage:3}],[BLOCK.LAVA_FLOW_4,{all:[1,12],fluid:true,flowStage:4}],[BLOCK.LAVA_FLOW_5,{all:[1,12],fluid:true,flowStage:5}],[BLOCK.FIRE,{all:[2,12],cutout:true,passable:true}],[BLOCK.NETHER_PORTAL,{all:[3,12],cutout:true,passable:true}],[BLOCK.END_PORTAL,{all:[31,11],entityOnly:true,passable:true}],[BLOCK.END_PORTAL_FRAME,{top:[19,10],side:[20,10],bottom:[22,10]}],
  [BLOCK.CHEST,{top:[25,14],side:[26,14],front:[27,14],bottom:[28,14],entityOnly:true}],[BLOCK.REDSTONE_WIRE,{all:[16,12],cutout:true,passable:true,entityOnly:true}],[BLOCK.PISTON,{top:[18,12],side:[20,12],bottom:[21,12],entityOnly:true}],[BLOCK.STICKY_PISTON,{top:[19,12],side:[20,12],bottom:[21,12],entityOnly:true}],[BLOCK.PISTON_HEAD,{all:[22,12],entityOnly:true}],[BLOCK.LEVER,{all:[23,12],cutout:true,passable:true}],[BLOCK.STONE_BUTTON,{all:[24,12],cutout:true,passable:true}],[BLOCK.STONE_PRESSURE_PLATE,{all:[25,12],cutout:true,passable:true}],
  [BLOCK.REPEATER,{all:[26,12],cutout:true,passable:true}],[BLOCK.REDSTONE_LAMP,{all:[28,12]}],[BLOCK.LIT_REDSTONE_LAMP,{all:[29,12]}],[BLOCK.COMMAND_BLOCK,{all:[30,12]}],[BLOCK.REPEATING_COMMAND_BLOCK,{all:[31,12]}],[BLOCK.CHAIN_COMMAND_BLOCK,{all:[16,13]}],[BLOCK.PRISMARINE,{all:[24,11]}],[BLOCK.PRISMARINE_BRICKS,{all:[25,11]}],[BLOCK.DARK_PRISMARINE,{all:[26,11]}],[BLOCK.SEA_LANTERN,{all:[27,11]}],[BLOCK.BLACKSTONE,{top:[16,11],side:[31,10],bottom:[16,11]}],[BLOCK.POLISHED_BLACKSTONE_BRICKS,{all:[17,11]}],[BLOCK.PURPUR_BLOCK,{all:[28,11]}],[BLOCK.PURPUR_PILLAR,{top:[30,11],side:[29,11],bottom:[30,11]}],[BLOCK.END_STONE_BRICKS,{all:[23,10]}],[BLOCK.CHORUS_PLANT,{all:[24,10],cutout:true,chorus:true}],[BLOCK.CHORUS_FLOWER,{all:[25,10],cutout:true,chorus:true}],[BLOCK.RAIL,{all:[17,13],cutout:true,passable:true,entityOnly:true}],[BLOCK.POWERED_RAIL,{all:[17,13],cutout:true,passable:true,entityOnly:true}],[BLOCK.REDSTONE_TORCH,{all:[26,13],cutout:true,passable:true,entityOnly:true}],[BLOCK.PAINTING,{all:[19,13],entityOnly:true,passable:true}],[BLOCK.ITEM_FRAME,{all:[19,13],entityOnly:true,passable:true}],[BLOCK.MAGMA_BLOCK,{all:[26,10]}],[BLOCK.NETHER_GOLD_ORE,{all:[27,10]}],[BLOCK.ANCIENT_DEBRIS,{top:[29,10],side:[28,10],bottom:[29,10]}],[BLOCK.CRYING_OBSIDIAN,{all:[30,10]}],[BLOCK.BASALT,{top:[19,11],side:[18,11],bottom:[19,11]}],[BLOCK.POLISHED_BASALT,{top:[21,11],side:[20,11],bottom:[21,11]}],[BLOCK.COPPER_BLOCK,{all:[22,13]}],[BLOCK.DEEPSLATE,{all:[23,13]}],[BLOCK.AMETHYST_BLOCK,{all:[24,13]}],[BLOCK.OAK_SAPLING,{all:[25,13],cutout:true,passable:true}],[BLOCK.TORCH,{all:[26,13],cutout:true,passable:true,entityOnly:true}],[BLOCK.LADDER,{all:[27,13],cutout:true,passable:true}],[BLOCK.ENCHANTING_TABLE,{top:[28,13],side:[29,13],bottom:[30,13]}],[BLOCK.ANVIL,{all:[31,13]}],[BLOCK.BEACON,{all:[16,14],cutout:true}],[BLOCK.HAY_BALE,{top:[18,14],side:[17,14],bottom:[18,14]}],[BLOCK.BELL,{all:[19,14],cutout:true,passable:true,entityOnly:true}],[BLOCK.BARREL,{top:[21,14],side:[20,14],bottom:[22,14]}],[BLOCK.OAK_FENCE,{all:[23,14]}],[BLOCK.GRASS_PATH,{top:[22,11],side:[23,11],bottom:[13,1]}],[BLOCK.MYCELIUM,{top:[24,14],side:[29,14],bottom:[13,1]}],[BLOCK.SLIME_BLOCK,{all:[30,14]}],[BLOCK.END_GATEWAY,{all:[31,11],entityOnly:true,passable:true}]
]);
const LIGHT_BLOCK_IDS=new Set([BLOCK.JACK_O_LANTERN,BLOCK.GLOWSTONE,BLOCK.LAVA,BLOCK.LAVA_FLOW_1,BLOCK.LAVA_FLOW_2,BLOCK.LAVA_FLOW_3,BLOCK.LAVA_FLOW_4,BLOCK.LAVA_FLOW_5,BLOCK.FIRE,BLOCK.NETHER_PORTAL,BLOCK.END_PORTAL,BLOCK.END_GATEWAY,BLOCK.LIT_REDSTONE_LAMP,BLOCK.SEA_LANTERN,BLOCK.REDSTONE_TORCH,BLOCK.MAGMA_BLOCK,BLOCK.CRYING_OBSIDIAN,BLOCK.TORCH,BLOCK.BEACON]);
const LAVA_LIGHT_IDS=new Set([BLOCK.LAVA,BLOCK.LAVA_FLOW_1,BLOCK.LAVA_FLOW_2,BLOCK.LAVA_FLOW_3,BLOCK.LAVA_FLOW_4,BLOCK.LAVA_FLOW_5]);
const FACE_DATA=[
  {d:[1,0,0],shade:.78,v:[[1,0,0],[1,1,0],[1,1,1],[1,0,1]],kind:'side'},
  {d:[-1,0,0],shade:.72,v:[[0,0,1],[0,1,1],[0,1,0],[0,0,0]],kind:'side'},
  {d:[0,1,0],shade:1,v:[[0,1,0],[0,1,1],[1,1,1],[1,1,0]],kind:'top'},
  {d:[0,-1,0],shade:.55,v:[[0,0,1],[0,0,0],[1,0,0],[1,0,1]],kind:'bottom'},
  {d:[0,0,1],shade:.86,v:[[1,0,1],[1,1,1],[0,1,1],[0,0,1]],kind:'side'},
  {d:[0,0,-1],shade:.66,v:[[0,0,0],[0,1,0],[1,1,0],[1,0,0]],kind:'front'}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
let seed=1337,world,worldW=DEFAULT_W,worldD=DEFAULT_D,originX=0,originZ=0,worldType='classic',dimension='overworld',deltaMap=new Map(),heightCache=new Map(),biomeCache=new Map(),structures=[],meshChunkFilter=null;
const idxLocal=(lx,y,lz)=>lx+lz*worldW+y*worldW*worldD;
const insideLocal=(lx,y,lz)=>lx>=0&&lx<worldW&&y>=0&&y<WORLD_H&&lz>=0&&lz<worldD;
const insideAbs=(x,y,z)=>insideLocal(x-originX,y,z-originZ);
const deltaKey=(x,y,z)=>`${x},${y},${z}`;
function progress(label,value){postMessage({type:'progress',label,progress:value});}
function hash2(x,z,s=seed){let n=(x*374761393+z*668265263+s*69069)|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;}
function valueNoise(x,z,scale){const fx=x/scale,fz=z/scale,x0=Math.floor(fx),z0=Math.floor(fz),tx=smooth(fx-x0),tz=smooth(fz-z0);const a=hash2(x0,z0),b=hash2(x0+1,z0),c=hash2(x0,z0+1),d=hash2(x0+1,z0+1);return lerp(lerp(a,b,tx),lerp(c,d,tx),tz);}
function biomeInfoAt(x,z){
  const key=`${x},${z}`;if(biomeCache.has(key))return biomeCache.get(key);
  const temperature=clamp(valueNoise(x+713,z-911,112)*.68+valueNoise(x-183,z+267,39)*.32,0,1);
  const moisture=clamp(valueNoise(x-1207,z+431,104)*.66+valueNoise(x+337,z-619,43)*.34,0,1);
  const rarity=valueNoise(x+1777,z-1559,57)*.72+valueNoise(x-887,z+993,23)*.28;
  let id='plains',name='Plains';
  if(rarity>.82&&moisture>.56&&temperature>.30&&temperature<.78){id='mushroom_fields';name='Mushroom Fields';}
  else if(temperature<.17){id='snowy_plains';name='Snowy Plains';}
  else if(temperature<.34){id='taiga';name='Taiga';}
  else if(temperature>.70&&moisture<.48){id='desert';name='Desert';}
  else if(moisture>.74&&temperature>.34&&temperature<.80){id='swamp';name='Swamp';}
  else if(moisture>.57){id='forest';name='Forest';}
  const info={id,name,temperature,moisture,cold:temperature<.22,hot:temperature>.72};biomeCache.set(key,info);return info;
}
// Compatibility scalar: old systems expect 0=hot/desert and 1=cold/snow.
function biomeAt(x,z){return 1-biomeInfoAt(x,z).temperature;}
function terrainHeight(x,z,type=worldType){
  const cacheKey=`${type}:${x},${z}`;if(heightCache.has(cacheKey))return heightCache.get(cacheKey);
  const finite=type!=='infinite',edge=finite?Math.min(x,z,DEFAULT_W-1-x,DEFAULT_D-1-z):12,biome=biomeInfoAt(x,z);
  const rolling=valueNoise(x,z,18)*.55+valueNoise(x+70,z-30,42)*.45;
  const mountainMask=Math.pow(valueNoise(x-680,z+410,74),2.25),ridge=Math.pow(1-Math.abs(valueNoise(x+220,z-190,27)*2-1),2.6);
  let height=WATER_LEVEL-10+rolling*20+mountainMask*ridge*28;
  if(biome.id==='swamp')height=lerp(height,WATER_LEVEL-1+valueNoise(x+91,z-47,22)*4,.78);
  else if(biome.id==='desert')height=lerp(height,WATER_LEVEL+2+rolling*9,.32);
  else if(biome.id==='snowy_plains')height+=2;
  if(finite&&edge<6)height=Math.min(height,WATER_LEVEL-2+edge*.65);
  const result=clamp(Math.floor(height),DEEPSLATE_LEVEL+2,WORLD_H-9);heightCache.set(cacheKey,result);return result;
}
function caveAt(x,y,z,surface){
  if(y<=2||y>surface)return false;
  const p1=Math.sin(x*.155+z*.071+y*.213+seed*.00037),p2=Math.cos(z*.137-x*.049-y*.181+seed*.00019),p3=Math.sin((x+z)*.052-y*.11);
  const depth=clamp((surface-y)/Math.max(1,surface-ORE_FLOOR),0,1),threshold=y>=surface-3?.045:(.115+depth*.075);
  return Math.abs(p1+p2*.78+p3*.42)<threshold;
}
function isDeepslateLayer(x,y,z){
  if(y<=DEEPSLATE_LEVEL-2)return true;
  if(y>=DEEPSLATE_LEVEL+3)return false;
  const chance=clamp((DEEPSLATE_LEVEL+3-y)/5,.08,.92);
  return hash2(x*41+y*7,z*43-y*5,seed+1777)<chance;
}
function treeCandidate(x,z,biome=biomeInfoAt(x,z)){
  if(biome.id==='desert'||biome.id==='mushroom_fields')return false;
  const spacing=biome.id==='forest'?6:biome.id==='taiga'?8:biome.id==='swamp'?10:biome.id==='snowy_plains'?14:13;
  const chance=biome.id==='forest'?.08:biome.id==='taiga'?.16:biome.id==='swamp'?.30:biome.id==='snowy_plains'?.48:.42;
  const cx=Math.floor(x/spacing),cz=Math.floor(z/spacing),span=Math.max(1,spacing-4),tx=cx*spacing+2+Math.floor(hash2(cx*13,cz*17,seed+209)*span),tz=cz*spacing+2+Math.floor(hash2(cx*19,cz*11,seed+307)*span);
  return x===tx&&z===tz&&hash2(cx,cz,seed+401)>chance;
}
function cactusCandidate(x,z){const spacing=13,cx=Math.floor(x/spacing),cz=Math.floor(z/spacing),tx=cx*spacing+3+Math.floor(hash2(cx*7,cz*23,seed+509)*7),tz=cz*spacing+3+Math.floor(hash2(cx*29,cz*5,seed+521)*7);return x===tx&&z===tz&&hash2(cx,cz,seed+541)>.34;}
function pumpkinCandidate(x,z){const spacing=22,cx=Math.floor(x/spacing),cz=Math.floor(z/spacing),tx=cx*spacing+5+Math.floor(hash2(cx*31,cz*7,seed+601)*12),tz=cz*spacing+5+Math.floor(hash2(cx*11,cz*37,seed+617)*12);return x===tx&&z===tz&&hash2(cx,cz,seed+631)>.70;}
function mushroomCandidate(x,z){const spacing=20,cx=Math.floor(x/spacing),cz=Math.floor(z/spacing),tx=cx*spacing+4+Math.floor(hash2(cx*43,cz*13,seed+641)*12),tz=cz*spacing+4+Math.floor(hash2(cx*17,cz*47,seed+647)*12);return x===tx&&z===tz&&hash2(cx,cz,seed+653)>.36;}
function desertWellCandidate(x,z){const spacing=72,cx=Math.floor(x/spacing),cz=Math.floor(z/spacing),tx=cx*spacing+12+Math.floor(hash2(cx*53,cz*31,seed+659)*48),tz=cz*spacing+12+Math.floor(hash2(cx*37,cz*59,seed+661)*48);return x===tx&&z===tz&&hash2(cx,cz,seed+673)>.42;}
function netherBlockAt(x,y,z){
  // v0.21.1: the Nether is a sealed cavern. Nothing natural exists above the bedrock roof.
  if(y<=0)return BLOCK.BEDROCK;
  if(y===NETHER_ROOF_Y)return BLOCK.BEDROCK;
  if(y>NETHER_ROOF_Y)return BLOCK.AIR;
  const floor=7+Math.floor(valueNoise(x+80,z-40,26)*9);
  const ceiling=75-Math.floor(valueNoise(x-50,z+120,31)*11);
  let solid=y<=floor||y>=ceiling;
  if(!solid&&y>floor+2&&y<ceiling-2){
    const bridge=Math.sin(x*.115+seed*.0011)+Math.cos(z*.109-seed*.0008)+Math.sin((x+z)*.043+y*.071);
    solid=bridge>1.72&&y<floor+18;
  }
  if(!solid)return y<=10?BLOCK.LAVA:BLOCK.AIR;
  const ore=hash2(x*19+y*11,z*23-y*7,seed+1901);
  if(y<18&&ore>.991)return BLOCK.ANCIENT_DEBRIS;
  if(ore>.974)return BLOCK.NETHER_QUARTZ_ORE;
  if(ore>.953&&ore<.962)return BLOCK.NETHER_GOLD_ORE;
  const region=valueNoise(x+400,z-330,38);
  if(region>.82&&y<30)return hash2(x+y,z-y,seed+1907)>.42?BLOCK.BASALT:BLOCK.BLACKSTONE;
  if(y===floor&&hash2(x,z,seed+1913)>.94)return BLOCK.MAGMA_BLOCK;
  return BLOCK.NETHERRACK;
}
function endIslandInfo(x,z,type){
  if(type!=='infinite'){
    const cx=DEFAULT_W/2,cz=DEFAULT_D/2,dx=x-cx,dz=z-cz,r=Math.hypot(dx,dz),radius=21;
    return{r,radius,top:25+Math.floor(valueNoise(x,z,12)*4-r*.08),central:true,centerX:cx,centerZ:cz};
  }
  const centralRadius=46,r0=Math.hypot(x,z);
  if(r0<=centralRadius+8)return{r:r0,radius:centralRadius,top:33+Math.floor(valueNoise(x,z,18)*4-r0*.055),central:true,centerX:0,centerZ:0};
  if(r0<500)return null;
  // Outer-island cells are 160 blocks apart; radii are capped at 28 so neighboring island edges
  // stay comfortably over the requested 100-block gap.
  const spacing=160,cx=Math.round(x/spacing),cz=Math.round(z/spacing);let best=null;
  for(let oz=-1;oz<=1;oz++)for(let ox=-1;ox<=1;ox++){
    const gx=cx+ox,gz=cz+oz;if(gx===0&&gz===0)continue;
    const centerX=gx*spacing+(hash2(gx,gz,seed+2101)-.5)*18,centerZ=gz*spacing+(hash2(gx,gz,seed+2107)-.5)*18;
    if(Math.hypot(centerX,centerZ)<500)continue;
    const r=Math.hypot(x-centerX,z-centerZ),radius=18+hash2(gx,gz,seed+2111)*10;
    const candidate={r,radius,top:30+Math.floor(valueNoise(x,z,18)*5-r*.06),central:false,centerX,centerZ,gx,gz};
    if(!best||r-radius<best.r-best.radius)best=candidate;
  }
  return best&&best.r<=best.radius+12?best:null;
}
function endBlockAt(x,y,z,type){
  const island=endIslandInfo(x,z,type);if(!island||island.r>island.radius)return BLOCK.AIR;
  const bottom=island.top-5-Math.floor((island.radius-island.r)*.24);
  return y<=island.top&&y>=Math.max(2,bottom)?BLOCK.END_STONE:BLOCK.AIR;
}
function terrainBlockAt(x,y,z,type=worldType){
  if(y<0)return BLOCK.BEDROCK;if(y>=WORLD_H)return BLOCK.AIR;
  if(dimension==='nether')return netherBlockAt(x,y,z);
  if(dimension==='end')return endBlockAt(x,y,z,type);
  if(type==='flat')return y===0?BLOCK.BEDROCK:(y<=2?BLOCK.DIRT:(y===3?BLOCK.GRASS:BLOCK.AIR));
  const h=terrainHeight(x,z,type),biome=biomeInfoAt(x,z);if(y>h)return y<=WATER_LEVEL?(biome.cold&&y===WATER_LEVEL?BLOCK.ICE:BLOCK.WATER):BLOCK.AIR;if(y===0)return BLOCK.BEDROCK;
  const beach=h<=WATER_LEVEL+1;let b;
  if(y===h){
    if(beach&&biome.id!=='swamp')b=BLOCK.SAND;
    else if(biome.id==='desert')b=BLOCK.SAND;
    else if(biome.id==='snowy_plains')b=BLOCK.SNOW_BLOCK;
    else if(biome.id==='mushroom_fields')b=BLOCK.MYCELIUM;
    else b=BLOCK.GRASS;
  }else if(y>=h-3)b=biome.id==='desert'?BLOCK.SANDSTONE:BLOCK.DIRT;
  else b=isDeepslateLayer(x,y,z)?BLOCK.DEEPSLATE:BLOCK.STONE;
  if(y<=h&&caveAt(x,y,z,h))return BLOCK.AIR;
  if((b===BLOCK.STONE||b===BLOCK.DEEPSLATE)&&y>ORE_FLOOR){
    const deep=b===BLOCK.DEEPSLATE,diamondRoll=hash2(x*37+y*23,z*41-y*17,seed+1881),morganiteRoll=hash2(x*29+y*17,z*31-y*13,seed+1421),ore=hash2(x*17+y*31,z*19-y*7,seed+421);
    if((deep&&y<DEEPSLATE_LEVEL&&diamondRoll>.99945)||(!deep&&y<DEEPSLATE_LEVEL+28&&diamondRoll>.99992))b=BLOCK.DIAMOND_ORE;
    else if(y<DEEPSLATE_LEVEL-5&&morganiteRoll>.9954)b=BLOCK.MORGANITE_ORE;
    else if(y<DEEPSLATE_LEVEL+2&&ore>.989)b=BLOCK.REDSTONE_ORE;
    else if(y<DEEPSLATE_LEVEL+8&&ore>.982&&ore<.989)b=BLOCK.GOLD_ORE;
    else if(y<DEEPSLATE_LEVEL+18&&ore>.974&&ore<.982)b=BLOCK.LAPIS_ORE;
    else if(y<DEEPSLATE_LEVEL+45&&ore>.958&&ore<.974)b=BLOCK.IRON_ORE;
    else if((biome.id==='taiga'||biome.id==='snowy_plains')&&y<DEEPSLATE_LEVEL+35&&ore>.954&&ore<.958)b=BLOCK.EMERALD_ORE;
    else if(ore>.935&&ore<.954)b=BLOCK.COAL_ORE;
    else if(!deep){const rock=hash2(x*5+y*13,z*7-y*11,seed+811);if(rock>.978)b=BLOCK.GRANITE;else if(rock<.022)b=BLOCK.DIORITE;else if(rock>.95&&rock<.963)b=BLOCK.ANDESITE;}
  }
  return b;
}
function treeAt(x,y,z,type=worldType){
  if(type==='flat'||dimension!=='overworld')return BLOCK.AIR;
  for(let tz=z-2;tz<=z+2;tz++)for(let tx=x-2;tx<=x+2;tx++){
    if(type!=='infinite'&&(tx<3||tz<3||tx>=DEFAULT_W-3||tz>=DEFAULT_D-3))continue;const biome=biomeInfoAt(tx,tz);if(!treeCandidate(tx,tz,biome))continue;
    const h=terrainHeight(tx,tz,type),top=terrainBlockAt(tx,h,tz,type);if(h<=WATER_LEVEL||![BLOCK.GRASS,BLOCK.SNOW_BLOCK].includes(top))continue;
    const base=h+1,trunk=(biome.id==='taiga'?6:biome.id==='forest'?5:4)+(hash2(tx,tz,seed+3)>.62?1:0);
    const log=(biome.id==='taiga'||biome.id==='snowy_plains')?BLOCK.SPRUCE_LOG:biome.id==='swamp'?BLOCK.DARK_OAK_LOG:(biome.id==='forest'&&hash2(tx,tz,seed+701)>.64?BLOCK.BIRCH_LOG:BLOCK.WOOD);
    if(x===tx&&z===tz&&y>=base&&y<base+trunk)return log;
    const oy=y-base,dx=x-tx,dz=z-tz;
    if(biome.id==='taiga'||biome.id==='snowy_plains'){
      if(oy>=trunk-3&&oy<=trunk+1){const radius=oy>=trunk?1:(oy===trunk-1?2:1);if(Math.abs(dx)<=radius&&Math.abs(dz)<=radius&&Math.abs(dx)+Math.abs(dz)<=radius+1)return BLOCK.LEAVES;}
    }else if(oy>=trunk-2&&oy<=trunk+1&&Math.abs(dx)<=2&&Math.abs(dz)<=2&&Math.abs(dx)+Math.abs(dz)+(oy===trunk+1?1:0)<=3)return BLOCK.LEAVES;
  }
  return BLOCK.AIR;
}
function mushroomAt(x,y,z,type=worldType){
  if(type==='flat'||dimension!=='overworld')return BLOCK.AIR;
  for(let tz=z-2;tz<=z+2;tz++)for(let tx=x-2;tx<=x+2;tx++){
    if(!mushroomCandidate(tx,tz)||biomeInfoAt(tx,tz).id!=='mushroom_fields')continue;const h=terrainHeight(tx,tz,type);if(terrainBlockAt(tx,h,tz,type)!==BLOCK.MYCELIUM)continue;
    const base=h+1,trunk=4+(hash2(tx,tz,seed+677)>.6?1:0),dx=x-tx,dz=z-tz,cap=hash2(tx,tz,seed+683)>.5?BLOCK.RED_WOOL:BLOCK.BROWN_WOOL;
    if(x===tx&&z===tz&&y>=base&&y<base+trunk)return BLOCK.BIRCH_LOG;
    if(y===base+trunk&&Math.abs(dx)<=2&&Math.abs(dz)<=2&&Math.abs(dx)+Math.abs(dz)<=3)return cap;
    if(y===base+trunk+1&&Math.abs(dx)<=1&&Math.abs(dz)<=1)return cap;
  }
  return BLOCK.AIR;
}
function surfaceFeatureAt(x,y,z,type=worldType){
  if(type==='flat'||dimension==='nether')return BLOCK.AIR;
  if(dimension==='end'){const info=endIslandInfo(x,z,type),top=info?.top||0;if(!info||info.central)return BLOCK.AIR;if(y>top&&y<=top+3&&hash2(Math.floor(x/3),Math.floor(z/3),seed+2201)>.84)return y===top+3?BLOCK.CHORUS_FLOWER:BLOCK.CHORUS_PLANT;return BLOCK.AIR;}
  const h=terrainHeight(x,z,type),top=terrainBlockAt(x,h,z,type),biome=biomeInfoAt(x,z);
  if(cactusCandidate(x,z)&&biome.id==='desert'&&h>WATER_LEVEL&&top===BLOCK.SAND){const height=2+(hash2(x,z,seed+557)>.62?1:0);if(y>h&&y<=h+height)return BLOCK.CACTUS;}
  if(pumpkinCandidate(x,z)&&['plains','forest','taiga'].includes(biome.id)&&h>WATER_LEVEL+1&&top===BLOCK.GRASS&&y===h+1)return BLOCK.PUMPKIN;
  return BLOCK.AIR;
}
function baseBlockAt(x,y,z,type=worldType){const raw=terrainBlockAt(x,y,z,type);if(raw!==BLOCK.AIR)return raw;const tree=treeAt(x,y,z,type);if(tree!==BLOCK.AIR)return tree;const mushroom=mushroomAt(x,y,z,type);return mushroom!==BLOCK.AIR?mushroom:surfaceFeatureAt(x,y,z,type);}
function generatedBlockAt(x,y,z){const changed=deltaMap.get(deltaKey(x,y,z));return changed===undefined?baseBlockAt(x,y,z,worldType):changed;}
function getBlockAbs(x,y,z){
  if(insideAbs(x,y,z))return world[idxLocal(x-originX,y,z-originZ)];
  if(worldType==='infinite')return generatedBlockAt(x,y,z);
  if(y<0&&x>=0&&x<DEFAULT_W&&z>=0&&z<DEFAULT_D)return BLOCK.BEDROCK;
  return BLOCK.AIR;
}
function setLocalAbs(x,y,z,v){if(insideAbs(x,y,z))world[idxLocal(x-originX,y,z-originZ)]=v;}
function findNetherInteriorFloor(x,z){
  for(let y=11;y<NETHER_ROOF_Y-3;y++){
    const ground=getBlockAbs(x,y,z),a=getBlockAbs(x,y+1,z),b=getBlockAbs(x,y+2,z);
    if(ground!==BLOCK.AIR&&ground!==BLOCK.LAVA&&ground!==BLOCK.BEDROCK&&a===BLOCK.AIR&&b===BLOCK.AIR)return y;
  }
  return -1;
}
function findSurface(x,z){if(dimension==='nether')return Math.max(1,findNetherInteriorFloor(x,z));for(let y=WORLD_H-1;y>=0;y--){const b=getBlockAbs(x,y,z);if(b!==BLOCK.AIR&&b!==BLOCK.WATER&&b!==BLOCK.LEAVES)return y;}return 0;}
function findWalkable(x,z){return dimension==='nether'?findNetherInteriorFloor(x,z):findSurface(x,z);}
function safeSpawnNear(cx,cz){
  let fallback=null;
  for(let r=0;r<=24;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){
    if(r&&Math.abs(dx)!==r&&Math.abs(dz)!==r)continue;
    const x=cx+dx,z=cz+dz,g=findWalkable(x,z);
    if(g<1)continue;
    if(!fallback)fallback={x,z,y:g};
    if(dimension==='nether'&&g+2>=NETHER_ROOF_Y)continue;
    if(g>(dimension==='overworld'?WATER_LEVEL+1:1)&&getBlockAbs(x,g+1,z)===BLOCK.AIR&&getBlockAbs(x,g+2,z)===BLOCK.AIR)return{spawnX:x+.5,spawnY:g+1.01,spawnZ:z+.5};
  }
  if(!fallback&&dimension==='nether'){
    for(let z=originZ;z<originZ+worldD&&!fallback;z++)for(let x=originX;x<originX+worldW;x++){const y=findNetherInteriorFloor(x,z);if(y>0){fallback={x,z,y};break;}}
  }
  fallback=fallback||{x:cx,z:cz,y:dimension==='overworld'?WATER_LEVEL+1:2};
  return{spawnX:fallback.x+.5,spawnY:Math.min(fallback.y+1.01,dimension==='nether'?NETHER_ROOF_Y-3:WORLD_H-2),spawnZ:fallback.z+.5};
}
function loadDeltas(raw){deltaMap=new Map();if(Array.isArray(raw))for(const d of raw){if(Array.isArray(d)&&d.length>=4)deltaMap.set(deltaKey(Number(d[0]),Number(d[1]),Number(d[2])),Number(d[3])||0);}}
function canGrowTree(tx,tz,type){
  if(type!=='infinite'&&(tx<3||tz<3||tx>=DEFAULT_W-3||tz>=DEFAULT_D-3))return false;const biome=biomeInfoAt(tx,tz),h=terrainHeight(tx,tz,type),top=terrainBlockAt(tx,h,tz,type);
  return treeCandidate(tx,tz,biome)&&h>WATER_LEVEL&&[BLOCK.GRASS,BLOCK.SNOW_BLOCK].includes(top);
}
function setTreeBlock(x,y,z,value){
  if(!insideAbs(x,y,z))return;const i=idxLocal(x-originX,y,z-originZ);if(world[i]===BLOCK.AIR)world[i]=value;
}
function populateTrees(type){
  if(type==='flat'||dimension!=='overworld')return;
  const minX=originX-2,maxX=originX+worldW+2,minZ=originZ-2,maxZ=originZ+worldD+2;let row=0,total=Math.max(1,maxZ-minZ+1);
  for(let tz=minZ;tz<=maxZ;tz++,row++){
    for(let tx=minX;tx<=maxX;tx++){
      if(!canGrowTree(tx,tz,type))continue;const h=terrainHeight(tx,tz,type),biome=biomeInfoAt(tx,tz),base=h+1,trunk=(biome.id==='taiga'?6:biome.id==='forest'?5:4)+(hash2(tx,tz,seed+3)>.62?1:0),log=(biome.id==='taiga'||biome.id==='snowy_plains')?BLOCK.SPRUCE_LOG:biome.id==='swamp'?BLOCK.DARK_OAK_LOG:(biome.id==='forest'&&hash2(tx,tz,seed+701)>.64?BLOCK.BIRCH_LOG:BLOCK.WOOD);
      for(let y=base;y<base+trunk;y++)setTreeBlock(tx,y,tz,log);
      if(biome.id==='taiga'||biome.id==='snowy_plains'){
        for(let oy=trunk-3;oy<=trunk+1;oy++){const radius=oy>=trunk?1:(oy===trunk-1?2:1);for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++){if(Math.abs(dx)+Math.abs(dz)>radius+1)continue;setTreeBlock(tx+dx,base+oy,tz+dz,BLOCK.LEAVES);}}
      }else for(let oy=trunk-2;oy<=trunk+1;oy++)for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){if(Math.abs(dx)+Math.abs(dz)+(oy===trunk+1?1:0)>3)continue;setTreeBlock(tx+dx,base+oy,tz+dz,BLOCK.LEAVES);}
    }
    if((row&15)===0)progress('Growing biome trees',38+Math.round((row+1)/total*7));
  }
}
function buildGiantMushroom(x,z,type){
  const biome=biomeInfoAt(x,z),h=terrainHeight(x,z,type);if(biome.id!=='mushroom_fields'||terrainBlockAt(x,h,z,type)!==BLOCK.MYCELIUM)return;const base=h+1,trunk=4+(hash2(x,z,seed+677)>.6?1:0),cap=hash2(x,z,seed+683)>.5?BLOCK.RED_WOOL:BLOCK.BROWN_WOOL;
  for(let y=base;y<base+trunk;y++)setTreeBlock(x,y,z,BLOCK.BIRCH_LOG);
  for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++)if(Math.abs(dx)+Math.abs(dz)<=3)setTreeBlock(x+dx,base+trunk,z+dz,cap);
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)setTreeBlock(x+dx,base+trunk+1,z+dz,cap);
}
function buildDesertWell(x,z,type){
  const h=terrainHeight(x,z,type);if(biomeInfoAt(x,z).id!=='desert'||h<=WATER_LEVEL+1)return;const y=h;
  for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++){setAt(x+dx,y,z+dz,BLOCK.SANDSTONE);for(let yy=y+1;yy<=y+5;yy++)setAt(x+dx,yy,z+dz,BLOCK.AIR);}
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const edge=Math.abs(dx)===1||Math.abs(dz)===1;setAt(x+dx,y+1,z+dz,edge?BLOCK.SANDSTONE:BLOCK.WATER);}
  for(const [dx,dz] of [[-2,-2],[2,-2],[-2,2],[2,2]])for(let yy=y+1;yy<=y+4;yy++)setAt(x+dx,yy,z+dz,BLOCK.SANDSTONE);
  for(let dz=-2;dz<=2;dz++)for(let dx=-2;dx<=2;dx++)setAt(x+dx,y+5,z+dz,BLOCK.SANDSTONE);
}
function populateSurfaceFeatures(type){
  if(type==='flat'||dimension==='nether')return;
  if(dimension==='end'){
    for(let z=originZ;z<originZ+worldD;z++)for(let x=originX;x<originX+worldW;x++){const info=endIslandInfo(x,z,type),top=info?.top||0;if(!info||info.central||!top||terrainBlockAt(x,top,z,type)!==BLOCK.END_STONE||hash2(Math.floor(x/3),Math.floor(z/3),seed+2201)<=.84)continue;const height=2+Math.floor(hash2(x,z,seed+2203)*3);for(let y=top+1;y<=Math.min(WORLD_H-2,top+height);y++)setTreeBlock(x,y,z,y===top+height?BLOCK.CHORUS_FLOWER:BLOCK.CHORUS_PLANT);}return;
  }
  for(let z=originZ;z<originZ+worldD;z++)for(let x=originX;x<originX+worldW;x++){
    const h=terrainHeight(x,z,type),top=terrainBlockAt(x,h,z,type),biome=biomeInfoAt(x,z);
    if(desertWellCandidate(x,z)&&biome.id==='desert'){buildDesertWell(x,z,type);continue;}
    if(mushroomCandidate(x,z)&&biome.id==='mushroom_fields'){buildGiantMushroom(x,z,type);continue;}
    if(cactusCandidate(x,z)&&biome.id==='desert'&&h>WATER_LEVEL&&top===BLOCK.SAND){const height=2+(hash2(x,z,seed+557)>.62?1:0);for(let y=h+1;y<=h+height;y++)setTreeBlock(x,y,z,BLOCK.CACTUS);}
    else if(pumpkinCandidate(x,z)&&['plains','forest','taiga'].includes(biome.id)&&h>WATER_LEVEL+1&&top===BLOCK.GRASS)setTreeBlock(x,h+1,z,BLOCK.PUMPKIN);
  }
}
function setAt(x,y,z,value,onlyAir=false){
  if(!insideAbs(x,y,z))return;
  const i=idxLocal(x-originX,y,z-originZ);if(onlyAir&&world[i]!==BLOCK.AIR)return;world[i]=value;
}
function fillBox(x0,y0,z0,x1,y1,z1,value,onlyAir=false){for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++)setAt(x,y,z,value,onlyAir);}
function hollowBox(x0,y0,z0,x1,y1,z1,wall){for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){const edge=x===x0||x===x1||y===y0||y===y1||z===z0||z===z1;setAt(x,y,z,edge?wall:BLOCK.AIR);}}
function topAt(x,z){for(let y=WORLD_H-2;y>=1;y--){const b=getBlockAbs(x,y,z);if(b!==BLOCK.AIR&&b!==BLOCK.WATER&&b!==BLOCK.LAVA&&b!==BLOCK.LEAVES)return y;}return 1;}
const STRUCTURE_DIMENSION=Object.freeze({village:'overworld',mineshaft:'overworld',stronghold:'overworld',ocean_monument:'overworld',bastion_remnant:'nether',end_city:'end',end_fountain:'end'});
function structureAllowedInDimension(type,dim=dimension){return STRUCTURE_DIMENSION[type]===dim;}
function recordStructure(type,x,y,z,extra={}){if(!structureAllowedInDimension(type))return false;structures.push({type,x,y,z,dimension,...extra});return true;}
function naturalTerrainTopAt(x,z){
  const approx=terrainHeight(x,z,worldType);for(let y=Math.min(WORLD_H-2,approx+2);y>=Math.max(1,approx-12);y--){const b=terrainBlockAt(x,y,z,worldType);if(b!==BLOCK.AIR&&b!==BLOCK.WATER&&b!==BLOCK.LAVA&&b!==BLOCK.LEAVES)return y;}return clamp(approx,1,WORLD_H-3);
}
function villageSupportMaterial(x,z,biome){
  // v0.21: foundations copy the structural material beneath the surface, never the living surface itself.
  const top=naturalTerrainTopAt(x,z),block=terrainBlockAt(x,top,z,worldType);
  if(biome.id==='desert'||block===BLOCK.SAND)return BLOCK.SAND;
  if(block===BLOCK.SANDSTONE)return BLOCK.SANDSTONE;
  if(block===BLOCK.STONE||block===BLOCK.COBBLESTONE||block===BLOCK.DEEPSLATE)return block;
  // Grass, grass path, snow and mycelium all sit on dirt in a supported village foundation.
  return BLOCK.DIRT;
}
const VILLAGE_HOUSE_CLEARANCE_RADIUS=4;
function fitVillageFoundation(hx,hz){
  let maxTop=1,minTop=WORLD_H;for(let z=hz-VILLAGE_HOUSE_CLEARANCE_RADIUS;z<=hz+VILLAGE_HOUSE_CLEARANCE_RADIUS;z++)for(let x=hx-VILLAGE_HOUSE_CLEARANCE_RADIUS;x<=hx+VILLAGE_HOUSE_CLEARANCE_RADIUS;x++){const top=naturalTerrainTopAt(x,z);maxTop=Math.max(maxTop,top);minTop=Math.min(minTop,top);}return{foundationY:clamp(maxTop+1,2,WORLD_H-9),maxTop,minTop};
}
function fillVillageFoundation(x0,z0,x1,z1,foundationY,biome){
  for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){const top=naturalTerrainTopAt(x,z),support=villageSupportMaterial(x,z,biome);for(let y=top+1;y<foundationY;y++)setAt(x,y,z,support);}
}
function villagePalette(biome){
  if(biome.id==='desert')return{foundation:BLOCK.SANDSTONE,wall:BLOCK.SANDSTONE,corner:BLOCK.ACACIA_LOG,roof:BLOCK.ACACIA_PLANKS,path:BLOCK.SANDSTONE};
  if(biome.id==='taiga'||biome.id==='snowy_plains')return{foundation:BLOCK.COBBLESTONE,wall:BLOCK.SPRUCE_PLANKS,corner:BLOCK.SPRUCE_LOG,roof:BLOCK.SPRUCE_PLANKS,path:BLOCK.GRASS_PATH};
  if(biome.id==='swamp')return{foundation:BLOCK.COBBLESTONE,wall:BLOCK.DARK_OAK_PLANKS,corner:BLOCK.DARK_OAK_LOG,roof:BLOCK.DARK_OAK_PLANKS,path:BLOCK.GRASS_PATH};
  if(biome.id==='forest')return{foundation:BLOCK.COBBLESTONE,wall:BLOCK.BIRCH_PLANKS,corner:BLOCK.BIRCH_LOG,roof:BLOCK.BIRCH_PLANKS,path:BLOCK.GRASS_PATH};
  return{foundation:BLOCK.COBBLESTONE,wall:BLOCK.PLANKS,corner:BLOCK.WOOD,roof:BLOCK.PLANKS,path:BLOCK.GRASS_PATH};
}
function buildVillageHouse(hx,hz,doorDir,index,biome){
  const x0=hx-2,x1=hx+2,z0=hz-2,z1=hz+2,fit=fitVillageFoundation(hx,hz),y=fit.foundationY,palette=villagePalette(biome);
  fillVillageFoundation(x0,z0,x1,z1,y,biome);
  // Clear only this house and roof volume; never flatten the entire village.
  fillBox(x0-1,y,z0-1,x1+1,y+7,z1+1,BLOCK.AIR);
  fillBox(x0,y,z0,x1,y,z1,palette.foundation);
  for(let yy=y+1;yy<=y+4;yy++)for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){const wall=x===x0||x===x1||z===z0||z===z1;setAt(x,yy,z,wall?palette.wall:BLOCK.AIR);}
  for(const [x,z] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1]])fillBox(x,y+1,z,x,y+4,z,palette.corner);
  fillBox(x0-1,y+5,z0-1,x1+1,y+5,z1+1,palette.roof);fillBox(x0,y+6,z0,x1,y+6,z1,palette.roof);
  let dx=0,dz=0,doorX=hx,doorZ=hz;if(doorDir==='north'){doorZ=z0;dz=-1;}else if(doorDir==='south'){doorZ=z1;dz=1;}else if(doorDir==='west'){doorX=x0;dx=-1;}else{doorX=x1;dx=1;}
  setAt(doorX,y+1,doorZ,BLOCK.DOOR);setAt(doorX,y+2,doorZ,BLOCK.DOOR);
  const windows=[[hx,y+2,z0],[hx,y+2,z1],[x0,y+2,hz],[x1,y+2,hz]];for(const [wx,wy,wz] of windows)if(wx!==doorX||wz!==doorZ)setAt(wx,wy,wz,BLOCK.GLASS);
  const chestX=hx+(-dz||1),chestZ=hz+(-dx||1);setAt(chestX,y+1,chestZ,index%2?BLOCK.BARREL:BLOCK.CHEST);setAt(hx,y+3,hz,BLOCK.TORCH);
  // Every generated home owns a real two-block bed. Keep it opposite the storage block.
  let bedX=hx-1,bedZ=hz,bedDx=0,bedDz=1;
  if(doorDir==='south'){bedDz=-1;}else if(doorDir==='west'){bedX=hx;bedZ=hz-1;bedDx=1;bedDz=0;}else if(doorDir==='east'){bedX=hx;bedZ=hz-1;bedDx=-1;bedDz=0;}
  setAt(bedX,y+1,bedZ,BLOCK.BED);setAt(bedX+bedDx,y+1,bedZ+bedDz,BLOCK.BED);
  const bed={x:bedX,y:y+1,z:bedZ,facing:[bedDx,0,bedDz],headX:bedX+bedDx,headZ:bedZ+bedDz};
  // Reserve one clear interior floor cell for the resident's profession workstation.
  let workstationX=hx+1,workstationZ=hz-1;
  if(doorDir==='south'){workstationZ=hz+1;}else if(doorDir==='west'){workstationX=hx-1;workstationZ=hz+1;}else if(doorDir==='east'){workstationX=hx+1;workstationZ=hz+1;}
  const workstationSite={x:workstationX,y:y+1,z:workstationZ},workstations=[BLOCK.ANVIL,BLOCK.FURNACE,BLOCK.CRAFTING_TABLE,BLOCK.ENCHANTING_TABLE,BLOCK.HAY_BALE,BLOCK.BARREL,BLOCK.CRAFTING_TABLE,BLOCK.CHEST,BLOCK.BOOKSHELF,BLOCK.STONE_BRICK,BLOCK.WHITE_WOOL,BLOCK.ANVIL,BLOCK.FURNACE],workstationBlock=workstations[index%workstations.length];
  setAt(workstationX,y+1,workstationZ,workstationBlock);
  return{x:doorX+dx*.75+.5,y:y+1,z:doorZ+dz*.75+.5,foundationY:y,doorX,doorZ,doorDir,roadX:doorX+dx,roadZ:doorZ+dz,bed,workstationSite,workstationBlock,professionIndex:index%workstations.length,container:{x:chestX,y:y+1,z:chestZ,loot:'village'}};
}
function paintVillagePathBlock(x,z,biome){
  if(!insideAbs(x,1,z))return;const top=topAt(x,z),topBlock=getBlockAbs(x,top,z);if(topBlock===BLOCK.GRASS)setAt(x,top,z,BLOCK.GRASS_PATH);else if(biome.id==='desert'&&topBlock===BLOCK.SAND)setAt(x,top,z,BLOCK.SANDSTONE);else if(topBlock===BLOCK.SNOW_BLOCK&&top>0&&getBlockAbs(x,top-1,z)===BLOCK.GRASS){setAt(x,top,z,BLOCK.AIR);setAt(x,top-1,z,BLOCK.GRASS_PATH);}
}
function connectVillageRoad(cx,cz,house,biome){
  const tx=house.roadX,tz=house.roadZ;let x=cx,z=cz;for(let side=-1;side<=1;side++)paintVillagePathBlock(x,z+side,biome);while(x!==tx){x+=tx<x?-1:1;for(let side=-1;side<=1;side++)paintVillagePathBlock(x,z+side,biome);}while(z!==tz){z+=tz<z?-1:1;for(let side=-1;side<=1;side++)paintVillagePathBlock(x+side,z,biome);}
}
function findVillageSite(cx,cz){
  let best={x:cx,z:cz,score:1e9};for(let r=0;r<=14;r+=2)for(let dz=-r;dz<=r;dz+=2)for(let dx=-r;dx<=r;dx+=2){if(r&&Math.abs(dx)!==r&&Math.abs(dz)!==r)continue;const x=cx+dx,z=cz+dz;if(!insideAbs(x,1,z))continue;const h=naturalTerrainTopAt(x,z);if(h<=WATER_LEVEL+1)continue;const n=[naturalTerrainTopAt(x+2,z),naturalTerrainTopAt(x-2,z),naturalTerrainTopAt(x,z+2),naturalTerrainTopAt(x,z-2)],slope=Math.max(...n,h)-Math.min(...n,h),biome=biomeInfoAt(x,z),penalty=biome.id==='swamp'?5:0,score=Math.hypot(dx,dz)+slope*2+penalty;if(score<best.score)best={x,z,score};}return best.score<1e9?best:{x:cx,z:cz};
}
function buildVillage(cx,cz){
  if(!structureAllowedInDimension('village'))return false;
  const site=findVillageSite(cx,cz);cx=site.x;cz=site.z;const biome=biomeInfoAt(cx,cz),houseCount=10+Math.floor(hash2(cx,cz,seed+9127)*6),slots=[[-12,-10],[-5,-12],[3,-12],[11,-9],[-13,-2],[13,-1],[-12,6],[-5,11],[3,12],[11,8],[-15,13],[15,13],[-16,-14],[16,-14],[0,17]],houses=[];
  for(let i=0;i<houseCount;i++){const [ox,oz]=slots[i],hx=cx+ox,hz=cz+oz,doorDir=Math.abs(ox)>Math.abs(oz)?(ox<0?'east':'west'):(oz<0?'south':'north'),home=buildVillageHouse(hx,hz,doorDir,i,biome);houses.push(home);connectVillageRoad(cx,cz,home,biome);}
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++)paintVillagePathBlock(cx+dx,cz+dz,biome);const squareY=topAt(cx,cz);setAt(cx,squareY+1,cz,BLOCK.BELL);
  const hx=cx-2,hz=cz+3,hayY=naturalTerrainTopAt(hx,hz)+1;fillBox(hx,hayY,hz,hx+1,hayY+1,hz+1,BLOCK.HAY_BALE);
  recordStructure('village',cx,squareY,cz,{houseCount,houses,biome:biome.id,biomeName:biome.name});
}
function buildMineshaft(cx,cz){
  if(!structureAllowedInDimension('mineshaft'))return false;
  const y=clamp(7+Math.floor(hash2(cx,cz,seed+3001)*5),5,13);recordStructure('mineshaft',cx,y,cz,{lootChests:[{x:cx+6,y,z:cz+1,loot:'mineshaft'}]});
  for(let x=cx-11;x<=cx+11;x++){fillBox(x,y,cz-1,x,y+2,cz+1,BLOCK.AIR);setAt(x,y-1,cz,BLOCK.RAIL);if((x-cx+11)%5===0){fillBox(x,y,cz-2,x,y+3,cz-2,BLOCK.PLANKS);fillBox(x,y,cz+2,x,y+3,cz+2,BLOCK.PLANKS);fillBox(x,y+3,cz-2,x,y+3,cz+2,BLOCK.PLANKS);}}
  for(let z=cz-9;z<=cz+9;z++){fillBox(cx-1,y,z,cx+1,y+2,z,BLOCK.AIR);setAt(cx,y-1,z,BLOCK.RAIL);}setAt(cx+6,y,cz+1,BLOCK.CHEST);setAt(cx-7,y+1,cz-1,BLOCK.COBWEB);
}
function buildStronghold(cx,cz){
  if(!structureAllowedInDimension('stronghold'))return false;
  const y=6;recordStructure('stronghold',cx,y,cz,{lootChests:[{x:cx+5,y:y+1,z:cz+5,loot:'stronghold'}]});hollowBox(cx-7,y,cz-7,cx+7,y+6,cz+7,BLOCK.STONE_BRICK);
  fillBox(cx-5,y+1,cz-1,cx+5,y+3,cz+1,BLOCK.AIR);fillBox(cx-1,y+1,cz-5,cx+1,y+3,cz+5,BLOCK.AIR);
  for(let z=cz-2;z<=cz+2;z++)for(let x=cx-2;x<=cx+2;x++){const edge=Math.abs(x-cx)===2||Math.abs(z-cz)===2;setAt(x,y+1,z,edge?BLOCK.END_PORTAL_FRAME:BLOCK.END_PORTAL);}setAt(cx+5,y+1,cz+5,BLOCK.CHEST);setAt(cx-5,y+1,cz-5,BLOCK.BOOKSHELF);
}
function buildOceanMonument(cx,cz){
  if(!structureAllowedInDimension('ocean_monument'))return false;
  const y=5;recordStructure('ocean_monument',cx,y,cz);fillBox(cx-7,y,cz-7,cx+7,WATER_LEVEL,cz+7,BLOCK.WATER);
  for(let level=0;level<4;level++){const r=6-level;fillBox(cx-r,y+level*2,cz-r,cx+r,y+level*2,cz+r,BLOCK.PRISMARINE_BRICKS);hollowBox(cx-r,y+level*2+1,cz-r,cx+r,y+level*2+3,cz+r,level%2?BLOCK.DARK_PRISMARINE:BLOCK.PRISMARINE);}
  setAt(cx,y+8,cz,BLOCK.SEA_LANTERN);for(const [dx,dz]of[[-5,-5],[5,-5],[-5,5],[5,5]])fillBox(cx+dx,y+1,cz+dz,cx+dx,y+5,cz+dz,BLOCK.SEA_LANTERN);
}
function buildBastion(cx,cz){
  if(!structureAllowedInDimension('bastion_remnant'))return false;
  const floor=findNetherInteriorFloor(cx,cz);if(floor<1)return false;const y=clamp(floor+1,13,NETHER_ROOF_Y-16);recordStructure('bastion_remnant',cx,y,cz,{lootChests:[{x:cx+5,y:y+2,z:cz+5,loot:'bastion'}]});hollowBox(cx-8,y,cz-8,cx+8,y+10,cz+8,BLOCK.BLACKSTONE);
  fillBox(cx-6,y+1,cz-6,cx+6,y+1,cz+6,BLOCK.POLISHED_BLACKSTONE_BRICKS);for(const [dx,dz]of[[-6,-6],[6,-6],[-6,6],[6,6]])fillBox(cx+dx,y+1,cz+dz,cx+dx,y+13,cz+dz,BLOCK.POLISHED_BLACKSTONE_BRICKS);
  fillBox(cx-1,y+1,cz-8,cx+1,y+4,cz-8,BLOCK.AIR);setAt(cx+5,y+2,cz+5,BLOCK.CHEST);setAt(cx-5,y+2,cz+5,BLOCK.CRYING_OBSIDIAN);fillBox(cx-2,y+2,cz-2,cx+2,y+2,cz+2,BLOCK.NETHER_GOLD_ORE);
}
function buildEndCity(cx,cz){
  if(!structureAllowedInDimension('end_city'))return false;
  const info=endIslandInfo(cx,cz,worldType);if(!info||info.central)return;const y=clamp((info?.top||24)+1,5,WORLD_H-18);recordStructure('end_city',cx,y,cz,{lootChests:[{x:cx,y:y+5,z:cz,loot:'end_city'}]});
  fillBox(cx-4,y,cz-4,cx+4,y,cz+4,BLOCK.END_STONE_BRICKS);for(const [dx,dz]of[[-3,-3],[3,-3],[-3,3],[3,3]])fillBox(cx+dx,y+1,cz+dz,cx+dx,y+13,cz+dz,BLOCK.PURPUR_PILLAR);
  for(const level of[4,9,14])fillBox(cx-4,y+level,cz-4,cx+4,y+level,cz+4,BLOCK.PURPUR_BLOCK);setAt(cx,y+5,cz,BLOCK.CHEST);setAt(cx+2,y+10,cz+2,BLOCK.ITEM_FRAME);setAt(cx-2,y+10,cz-2,BLOCK.PURPUR_BLOCK);
}
function buildEndArena(cx,cz){
  if(!structureAllowedInDimension('end_fountain'))return false;
  const info=endIslandInfo(cx,cz,worldType),y=clamp((info?.top||24)+1,5,WORLD_H-24);recordStructure('end_fountain',cx,y,cz,{pillarCount:7,pillarWidth:5});
  fillBox(cx-2,y,cz-2,cx+2,y,cz+2,BLOCK.BEDROCK);setAt(cx,y+1,cz,BLOCK.END_PORTAL);
  // Seven pillars, each five blocks wide (two blocks out from the center on every side).
  // Seeded heights keep the ring varied while its count and footprint stay deterministic.
  for(let i=0;i<7;i++){const angle=i*Math.PI*2/7+hash2(cx,cz,seed+7711)*.18,radius=17+(i%2)*3,px=Math.round(cx+Math.cos(angle)*radius),pz=Math.round(cz+Math.sin(angle)*radius),h=11+Math.floor(hash2(i,cx+cz,seed+7723)*10);fillBox(px-2,y,pz-2,px+2,Math.min(WORLD_H-2,y+h),pz+2,BLOCK.OBSIDIAN);}
}
function structureCells(spacing,callback){
  const minCX=Math.floor((originX-24)/spacing),maxCX=Math.floor((originX+worldW+24)/spacing),minCZ=Math.floor((originZ-24)/spacing),maxCZ=Math.floor((originZ+worldD+24)/spacing);
  for(let cz=minCZ;cz<=maxCZ;cz++)for(let cx=minCX;cx<=maxCX;cx++){const x=cx*spacing+18+Math.floor(hash2(cx,cz,seed+3301)*(spacing-36)),z=cz*spacing+18+Math.floor(hash2(cx,cz,seed+3307)*(spacing-36));callback(x,z,cx,cz);}
}
function populateStructures(type){
  structures=[];if(type==='flat'&&dimension!=='overworld')return;
  if(type!=='infinite'){
    if(dimension==='overworld'){buildVillage(24,24);buildOceanMonument(37,10);buildMineshaft(13,35);buildStronghold(36,36);}
    else if(dimension==='nether')buildBastion(24,24);
    else{buildEndArena(24,24);buildEndCity(37,34);}
    return;
  }
  if(dimension==='overworld')structureCells(128,(x,z,cx,cz)=>{const choice=Math.floor(hash2(cx,cz,seed+3319)*4);[buildVillage,buildMineshaft,buildStronghold,buildOceanMonument][choice](x,z);});
  else if(dimension==='nether')structureCells(96,(x,z)=>buildBastion(x,z));
  else{buildEndArena(0,0);structureCells(320,(x,z,cx,cz)=>{if(Math.hypot(x,z)<500)return;const info=endIslandInfo(x,z,'infinite');if(!info||info.central)return;if(hash2(cx,cz,seed+3371)>.48)buildEndCity(Math.round(info.centerX),Math.round(info.centerZ));});}
}
function applyActiveDeltas(){
  for(const [key,value] of deltaMap){const parts=key.split(',');if(parts.length!==3)continue;const x=Number(parts[0]),y=Number(parts[1]),z=Number(parts[2]);if(insideAbs(x,y,z))world[idxLocal(x-originX,y,z-originZ)]=value;}
}
function generateFinite(type){
  worldType=type;originX=originZ=0;worldW=DEFAULT_W;worldD=DEFAULT_D;deltaMap=new Map();heightCache=new Map();biomeCache=new Map();world=new Uint8Array(worldW*WORLD_H*worldD);
  for(let z=0;z<worldD;z++){for(let x=0;x<worldW;x++)for(let y=0;y<WORLD_H;y++)world[idxLocal(x,y,z)]=terrainBlockAt(x,y,z,type);if((z&3)===0)progress('Generating terrain',Math.round((z+1)/worldD*38));}
  populateTrees(type);populateSurfaceFeatures(type);populateStructures(type);
  const sx=Math.floor(worldW/2),sz=Math.floor(worldD/2);return safeSpawnNear(sx,sz);
}
function generateInfinite(centerX,centerZ,radius,deltas){
  worldType='infinite';loadDeltas(deltas);heightCache=new Map();biomeCache=new Map();const r=clamp(Number(radius)||3,2,6);originX=(centerX-r)*CHUNK_SIZE;originZ=(centerZ-r)*CHUNK_SIZE;worldW=worldD=(r*2+1)*CHUNK_SIZE;world=new Uint8Array(worldW*WORLD_H*worldD);
  for(let lz=0;lz<worldD;lz++){const z=originZ+lz;for(let lx=0;lx<worldW;lx++){const x=originX+lx;for(let y=0;y<WORLD_H;y++)world[idxLocal(lx,y,lz)]=terrainBlockAt(x,y,z,'infinite');}if((lz&3)===0)progress('Streaming chunks',Math.round((lz+1)/worldD*38));}
  populateTrees('infinite');populateSurfaceFeatures('infinite');populateStructures('infinite');applyActiveDeltas();
  const sx=centerX*CHUNK_SIZE+8,sz=centerZ*CHUNK_SIZE+8;return safeSpawnNear(sx,sz);
}
function blockTile(block,kind,x,z){const d=TILES.get(block);if(block===BLOCK.GRASS&&Number.isFinite(x)&&Number.isFinite(z)&&biomeAt(x,z)>.78){if(kind==='top')return[29,0];if(kind!=='bottom')return[30,0];}return d?.all||d?.[kind]||d?.side||d?.top||[0,0];}
function tileUV(tile){const[x,y]=tile,pad=.5,size=16,w=512,h=256;return[(x*size+pad)/w,(y*size+pad)/h,((x+1)*size-pad)/w,((y+1)*size-pad)/h];}
const SEEDED_ROTATION_BLOCKS=new Set([
  BLOCK.DIRT,BLOCK.STONE,BLOCK.SAND,BLOCK.BRICK,BLOCK.GOLD_BLOCK,BLOCK.COBBLESTONE,BLOCK.MOSSY_COBBLESTONE,BLOCK.STONE_BRICK,
  BLOCK.BEDROCK,BLOCK.OBSIDIAN,BLOCK.CLAY,BLOCK.SANDSTONE,BLOCK.GRAVEL,BLOCK.IRON_BLOCK,BLOCK.DIAMOND_BLOCK,
  BLOCK.COAL_BLOCK,BLOCK.EMERALD_BLOCK,BLOCK.REDSTONE_BLOCK,BLOCK.GOLD_ORE,BLOCK.IRON_ORE,BLOCK.COAL_ORE,BLOCK.DIAMOND_ORE,
  BLOCK.GRANITE,BLOCK.POLISHED_GRANITE,BLOCK.DIORITE,BLOCK.POLISHED_DIORITE,BLOCK.ANDESITE,BLOCK.POLISHED_ANDESITE,
  BLOCK.CRACKED_STONE_BRICKS,BLOCK.CHISELED_STONE_BRICKS,BLOCK.LAPIS_BLOCK,BLOCK.LAPIS_ORE,BLOCK.REDSTONE_ORE,BLOCK.EMERALD_ORE,
  BLOCK.NETHER_QUARTZ_ORE,BLOCK.NETHERRACK,BLOCK.SOUL_SAND,BLOCK.GLOWSTONE,BLOCK.NETHER_BRICKS,BLOCK.END_STONE,
  BLOCK.QUARTZ_BLOCK,BLOCK.MORGANITE_ORE,BLOCK.PRISMARINE,BLOCK.PRISMARINE_BRICKS,BLOCK.DARK_PRISMARINE,
  BLOCK.BLACKSTONE,BLOCK.POLISHED_BLACKSTONE_BRICKS,BLOCK.END_STONE_BRICKS,BLOCK.NETHER_GOLD_ORE,BLOCK.ANCIENT_DEBRIS,
  BLOCK.CRYING_OBSIDIAN,BLOCK.BASALT,BLOCK.POLISHED_BASALT,BLOCK.COPPER_BLOCK,BLOCK.DEEPSLATE,BLOCK.AMETHYST_BLOCK,
  BLOCK.WHITE_WOOL,BLOCK.ORANGE_WOOL,BLOCK.MAGENTA_WOOL,BLOCK.LIGHT_BLUE_WOOL,BLOCK.YELLOW_WOOL,BLOCK.LIME_WOOL,
  BLOCK.PINK_WOOL,BLOCK.GRAY_WOOL,BLOCK.LIGHT_GRAY_WOOL,BLOCK.CYAN_WOOL,BLOCK.PURPLE_WOOL,BLOCK.BLUE_WOOL,
  BLOCK.BROWN_WOOL,BLOCK.GREEN_WOOL,BLOCK.RED_WOOL,BLOCK.BLACK_WOOL
]);
function seededTextureFaceRotates(id,kind){if(id===BLOCK.GRASS)return kind==='top'||kind==='bottom';return SEEDED_ROTATION_BLOCKS.has(id);}
function seededTextureQuarterTurn(id,kind,x,y,z){if(!seededTextureFaceRotates(id,kind))return 0;let h=(seed|0)^Math.imul((x|0),0x1f123bb5)^Math.imul((y|0),0x5f356495)^Math.imul((z|0),0x6c8e9cf5)^Math.imul((id|0),0x27d4eb2d);h^=h>>>15;h=Math.imul(h,0x2c1b3c6d);h^=h>>>12;h=Math.imul(h,0x297a2d39);h^=h>>>15;return h&3;}
function pushWorldQuad(arr,verts,uv,shade,sky,ox,oy,oz,quarterTurns=0){const[u0,v0,u1,v1]=uv,base=[[u0,v1],[u0,v0],[u1,v0],[u1,v1]],q=quarterTurns&3,uvv=q?base.map((_,i)=>base[(i+q)&3]):base,order=[0,1,2,0,2,3];for(const i of order){const p=verts[i],t=uvv[i];arr.push(p[0]+ox,p[1]+oy,p[2]+oz,t[0],t[1],shade,sky);}}
function pushCobwebMesh(arr,x,y,z){const uv=tileUV(TILES.get(BLOCK.COBWEB).all),sky=faceSkyLevel(x,y,z),planes=[[[0,0,0],[0,1,0],[1,1,1],[1,0,1]],[[1,0,0],[1,1,0],[0,1,1],[0,0,1]],[[0,.5,0],[0,.5,1],[1,.5,1],[1,.5,0]]];for(const plane of planes){pushWorldQuad(arr,plane,uv,1,sky,x,y,z);pushWorldQuad(arr,[plane[3],plane[2],plane[1],plane[0]],uv,1,sky,x,y,z);}}
const SHORT_BLOCK_HEIGHTS=new Map([[BLOCK.ENCHANTING_TABLE,12/16],[BLOCK.END_PORTAL_FRAME,13/16]]),FLOW_HEIGHTS=[1,.84,.68,.52,.36,.20];
function blockModelHeight(id){const stage=Number(TILES.get(id)?.flowStage)||0;return stage?FLOW_HEIGHTS[Math.max(1,Math.min(5,stage))]:SHORT_BLOCK_HEIGHTS.get(id)||1;}
function faceVertsForBlock(id,face){const h=blockModelHeight(id);if(h===1)return face.v;return face.v.map(v=>[v[0],v[1]===1?h:v[1],v[2]]);}
function faceUVForBlock(id,face,x,z){const uv=tileUV(blockTile(id,face.kind,x,z)),h=blockModelHeight(id);if(h===1||face.kind==='top'||face.kind==='bottom')return uv;const[u0,v0,u1,v1]=uv;return[u0,v0+(v1-v0)*(1-h),u1,v1];}
const isCutout=b=>!!TILES.get(b)?.cutout;
const isFluid=b=>!!TILES.get(b)?.fluid;
const isOpaque=b=>b!==BLOCK.AIR&&!isFluid(b)&&!isCutout(b)&&!TILES.get(b)?.entityOnly;
let skyColumnBlockerCache=new Map(),skyFaceLevelCache=new Map();
function resetSkyLightCaches(){skyColumnBlockerCache=new Map();skyFaceLevelCache=new Map();}
function skyLightPassable(id){const d=TILES.get(id);return id===BLOCK.AIR||isFluid(id)||isCutout(id)||!!d?.entityOnly||!!d?.passable;}
function skyColumnKey(x,z){return insideAbs(x,0,z)?((z-originZ)*worldW+(x-originX)):`${x},${z}`;}
function skyCellKey(x,y,z){return insideAbs(x,y,z)?idxLocal(x-originX,y,z-originZ):`${x},${y},${z}`;}
function highestSkyBlockerY(x,z){const key=skyColumnKey(x,z);if(skyColumnBlockerCache.has(key))return skyColumnBlockerCache.get(key);let blocker=-1;for(let yy=WORLD_H-1;yy>=0;yy--){if(!skyLightPassable(getBlockAbs(x,yy,z))){blocker=yy;break;}}skyColumnBlockerCache.set(key,blocker);return blocker;}
function directSkyAt(x,y,z){return dimension==='overworld'&&y>highestSkyBlockerY(x,z);}
function faceSkyLevel(x,y,z){
  if(dimension!=='overworld')return 1;if(y<0||y>=WORLD_H)return 1;const key=skyCellKey(x,y,z);if(skyFaceLevelCache.has(key))return skyFaceLevelCache.get(key);
  if(!skyLightPassable(getBlockAbs(x,y,z))){skyFaceLevelCache.set(key,0);return 0;}if(directSkyAt(x,y,z)){skyFaceLevelCache.set(key,1);return 1;}
  const queue=[[x,y,z,0]],seen=new Set([key]),dirs=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];let result=0;
  for(let qi=0;qi<queue.length;qi++){const[cx,cy,cz,d]=queue[qi];if(d>=3)continue;for(const dir of dirs){const nx=cx+dir[0],ny=cy+dir[1],nz=cz+dir[2],nd=d+1;if(ny<0||ny>=WORLD_H)continue;const nk=skyCellKey(nx,ny,nz);if(seen.has(nk)||!skyLightPassable(getBlockAbs(nx,ny,nz)))continue;seen.add(nk);if(directSkyAt(nx,ny,nz)){result=(4-nd)/4;qi=queue.length;break;}queue.push([nx,ny,nz,nd]);}}
  skyFaceLevelCache.set(key,result);return result;
}
const CHORUS_FACE_DATA=[
  {kind:'north',shade:.82,v:[[.22,0,.22],[.22,1,.22],[.78,1,.22],[.78,0,.22]]},
  {kind:'south',shade:.9,v:[[.78,0,.78],[.78,1,.78],[.22,1,.78],[.22,0,.78]]},
  {kind:'west',shade:.76,v:[[.22,0,.78],[.22,1,.78],[.22,1,.22],[.22,0,.22]]},
  {kind:'east',shade:.86,v:[[.78,0,.22],[.78,1,.22],[.78,1,.78],[.78,0,.78]]},
  {kind:'top',shade:1,v:[[.22,1,.22],[.22,1,.78],[.78,1,.78],[.78,1,.22]]},
  {kind:'bottom',shade:.66,v:[[.22,0,.78],[.22,0,.22],[.78,0,.22],[.78,0,.78]]}
];
function buildMesh(){
  resetSkyLightCaches();
  const chunks=[],entityBlocks=[],lightBlocks=[],minCx=Math.floor(originX/CHUNK_SIZE),maxCx=Math.floor((originX+worldW-1)/CHUNK_SIZE),minCz=Math.floor(originZ/CHUNK_SIZE),maxCz=Math.floor((originZ+worldD-1)/CHUNK_SIZE),total=(maxCx-minCx+1)*(maxCz-minCz+1);let completed=0;
  for(let cz=minCz;cz<=maxCz;cz++)for(let cx=minCx;cx<=maxCx;cx++){
    const shouldMesh=!meshChunkFilter||meshChunkFilter.has(`${cx},${cz}`),solid=[],cutouts=[],leafInstances=[],water=[],shell=new Set(),x0=Math.max(originX,cx*CHUNK_SIZE),x1=Math.min(originX+worldW,(cx+1)*CHUNK_SIZE),z0=Math.max(originZ,cz*CHUNK_SIZE),z1=Math.min(originZ+worldD,(cz+1)*CHUNK_SIZE);
    const addShell=(x,y,z)=>{if(!shouldMesh||y<0||y>=WORLD_H||x<x0||x>=x1||z<z0||z>=z1)return;const id=getBlockAbs(x,y,z);if(id===BLOCK.AIR||TILES.get(id)?.entityOnly)return;const lx=x-cx*CHUNK_SIZE,lz=z-cz*CHUNK_SIZE;if(lx<0||lx>=CHUNK_SIZE||lz<0||lz>=CHUNK_SIZE)return;shell.add(y*CHUNK_SIZE*CHUNK_SIZE+lz*CHUNK_SIZE+lx);};
    for(let y=0;y<WORLD_H;y++)for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){
        const b=world[idxLocal(x-originX,y,z-originZ)];if(b===BLOCK.AIR)continue;
        if(LIGHT_BLOCK_IDS.has(b)&&(!LAVA_LIGHT_IDS.has(b)||((x&3)===0&&(y&1)===0&&(z&3)===0)))lightBlocks.push(x,y,z,b);
        if(TILES.get(b)?.entityOnly){entityBlocks.push(x,y,z,b);continue;}
        if(!shouldMesh)continue;
        if(b===BLOCK.LEAVES){leafInstances.push(x,y,z,biomeAt(x,z)>.78?1:0);addShell(x,y,z);continue;}
        if(b===BLOCK.COBWEB){pushCobwebMesh(cutouts,x,y,z);addShell(x,y,z);continue;}
        const target=isFluid(b)?water:(isCutout(b)?cutouts:solid);
        for(const f of FACE_DATA){const n=getBlockAbs(x+f.d[0],y+f.d[1],z+f.d[2]);let visible=false;
          if(isFluid(b))visible=n!==b&&(f.kind==='top'||n===BLOCK.AIR||TILES.get(n)?.passable);
          else if(isCutout(b))visible=n!==b&&(!isOpaque(n)||n===BLOCK.AIR);
          else visible=n===BLOCK.AIR||isFluid(n)||isCutout(n)||TILES.get(n)?.entityOnly;
          if(visible){
            pushWorldQuad(target,faceVertsForBlock(b,f),faceUVForBlock(b,f,x,z),f.shade,faceSkyLevel(x+f.d[0],y+f.d[1],z+f.d[2]),x,y,z,seededTextureQuarterTurn(b,f.kind,x,y,z));
            // Keep the visible block plus two solid blocks behind that exposed face in
            // a compact CPU shell. Local edits can remesh this frontier instead of
            // scanning all 200 vertical blocks in the chunk.
            addShell(x,y,z);addShell(x-f.d[0],y-f.d[1],z-f.d[2]);addShell(x-f.d[0]*2,y-f.d[1]*2,z-f.d[2]*2);
          }
        }
      }
    if(shouldMesh)chunks.push({cx,cz,solid:new Float32Array(solid),cutouts:new Float32Array(cutouts),leafInstances:new Float32Array(leafInstances),water:new Float32Array(water),shell:new Int32Array(shell)});completed++;progress('Building visible chunks',45+Math.round(completed/total*50));
  }
  return{chunks,entityBlocks,lightBlocks};
}
self.onmessage=event=>{
  try{
    const data=event.data||{};seed=Number(data.seed)||1337;dimension=['nether','end'].includes(data.dimension)?data.dimension:'overworld';meshChunkFilter=Array.isArray(data.meshChunkKeys)?new Set(data.meshChunkKeys.map(String)):null;let spawn={};
    if(data.action==='generate')spawn=generateFinite(data.worldType==='flat'?'flat':'classic');
    else if(data.action==='infinite')spawn=generateInfinite(Number(data.centerChunkX)||0,Number(data.centerChunkZ)||0,data.radius,data.deltas);
    else if(data.action==='mesh'){
      worldType=data.worldType==='flat'?'flat':'classic';originX=Number(data.originX)||0;originZ=Number(data.originZ)||0;worldW=Number(data.worldW)||DEFAULT_W;worldD=Number(data.worldD)||DEFAULT_D;
      if(!(data.worldBuffer instanceof ArrayBuffer))throw new Error('Missing saved world data.');world=new Uint8Array(data.worldBuffer);if(world.length!==worldW*WORLD_H*worldD)throw new Error('Saved world has the wrong size.');
    }else throw new Error('Unknown world worker action.');
    structures=structures.filter(s=>structureAllowedInDimension(s.type,s.dimension));const built=buildMesh(),bufferOrNull=array=>array.byteLength?array.buffer:null,meshChunks=built.chunks.map(chunk=>({cx:chunk.cx,cz:chunk.cz,solidBuffer:bufferOrNull(chunk.solid),leafBuffer:bufferOrNull(chunk.cutouts),leafInstanceBuffer:bufferOrNull(chunk.leafInstances),waterBuffer:bufferOrNull(chunk.water),shellBuffer:bufferOrNull(chunk.shell)})),entityBlockData=new Int32Array(built.entityBlocks),lightBlockData=new Int32Array(built.lightBlocks),transfers=[world.buffer,entityBlockData.buffer,lightBlockData.buffer];for(const chunk of meshChunks)for(const buffer of[chunk.solidBuffer,chunk.leafBuffer,chunk.leafInstanceBuffer,chunk.waterBuffer,chunk.shellBuffer])if(buffer)transfers.push(buffer);progress('World ready',100);
    postMessage({type:'done',dimension,structures,worldBuffer:world.buffer,worldW,worldD,originX,originZ,meshChunks,entityBlocksBuffer:entityBlockData.buffer,lightBlocksBuffer:lightBlockData.buffer,...spawn},transfers);
  }catch(error){postMessage({type:'error',message:error?.message||String(error)});}
};
