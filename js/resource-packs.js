
(() => {
  'use strict';

  const STORE_KEY = 'dorukcraft-resource-pack-v010';
  const imageFromBlob = blob => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('A texture image could not be decoded.')); };
    image.src = url;
  });
  const imageFromURL = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = globalThis.DorukFileCompat?.resolveAssetURL?.(src) || src;
  });
  const slug = name => String(name || '').toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
    .replace(/^wooden_/, 'oak_').replace('block_of_quartz', 'quartz_block').replace('wooden_door', 'oak_door');
  const firstFrame = image => {
    const side = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height);
    return { image, sx: 0, sy: 0, sw: side, sh: side };
  };
  const drawFrame = (ctx, frame, dx, dy, size = 16) => {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(dx, dy, size, size);
    ctx.drawImage(frame.image, frame.sx, frame.sy, frame.sw, frame.sh, dx, dy, size, size);
  };

  const OVERRIDES = Object.freeze({
    'Grass Block': { top:['grass_block_top','grass_top'], side:['grass_block_side','grass_side'], bottom:['dirt'] },
    'Oak Log': { top:['oak_log_top','log_oak_top','log_top'], side:['oak_log','log_oak','log_side'] },
    'Spruce Log': { top:['spruce_log_top','log_spruce_top'], side:['spruce_log','log_spruce'] },
    'Birch Log': { top:['birch_log_top','log_birch_top'], side:['birch_log','log_birch'] },
    'Jungle Log': { top:['jungle_log_top','log_jungle_top'], side:['jungle_log','log_jungle'] },
    'Acacia Log': { top:['acacia_log_top','log_acacia_top'], side:['acacia_log','log_acacia'] },
    'Dark Oak Log': { top:['dark_oak_log_top','log_big_oak_top'], side:['dark_oak_log','log_big_oak'] },
    'Crafting Table': { top:['crafting_table_top','workbench_top'], side:['crafting_table_side','workbench_side'], front:['crafting_table_front','workbench_front'] },
    'Furnace': { top:['furnace_top'], side:['furnace_side'], front:['furnace_front_off','furnace_front'] },
    'TNT': { top:['tnt_top'], side:['tnt_side'], bottom:['tnt_bottom'] },
    'Cactus': { top:['cactus_top'], side:['cactus_side'], bottom:['cactus_bottom'] },
    'Pumpkin': { top:['pumpkin_top'], side:['pumpkin_side'], front:['pumpkin_face_off','pumpkin_face'] },
    "Jack o'Lantern": { top:['pumpkin_top'], side:['pumpkin_side'], front:['jack_o_lantern','pumpkin_face_on'] },
    'Piston': { top:['piston_top','piston_top_normal'], side:['piston_side'], bottom:['piston_bottom'] },
    'Sticky Piston': { top:['piston_top_sticky'], side:['piston_side'], bottom:['piston_bottom'] },
    'Command Block': { all:['command_block'] },
    'Repeating Command Block': { all:['repeating_command_block'] },
    'Chain Command Block': { all:['chain_command_block'] },
    'Redstone Wire': { all:['redstone_dust_dot','redstone_dust_line0','redstone_dust_line'] },
    'Nether Portal': { all:['nether_portal','portal'] },
    'End Portal': { all:['end_portal'] },
    'Oak Door': { all:['oak_door_bottom','door_wood_lower'] },
    'Water': { all:['water_still','water'] },
    'Lava': { all:['lava_still','lava'] }
  });

  // Indices used by pre-1.6 terrain.png packs. Unknown tiles keep DorukCraft's base art.
  const LEGACY = Object.freeze({
    'Grass Block':{top:[0,0],side:[3,0],bottom:[2,0]},Stone:{all:[1,0]},Dirt:{all:[2,0]},
    'Oak Planks':{all:[4,0]},Bricks:{all:[7,0]},TNT:{side:[8,0],top:[9,0],bottom:[10,0]},Cobweb:{all:[11,0]},
    Cobblestone:{all:[0,1]},Bedrock:{all:[1,1]},Sand:{all:[2,1]},Gravel:{all:[3,1]},
    'Oak Log':{side:[4,1],top:[5,1],bottom:[5,1]},'Iron Block':{all:[6,1]},'Gold Block':{all:[7,1]},'Diamond Block':{all:[8,1]},
    'Gold Ore':{all:[0,2]},'Iron Ore':{all:[1,2]},'Coal Ore':{all:[2,2]},Bookshelf:{all:[3,2]},
    'Mossy Cobblestone':{all:[4,2]},Obsidian:{all:[5,2]},'Grass Side':{all:[6,2]},
    Sponge:{all:[0,3]},Glass:{all:[1,3]},'Diamond Ore':{all:[2,3]},'Redstone Ore':{all:[3,3]},Leaves:{all:[4,3]},
    'Stone Bricks':{all:[6,3]},'Dead Bush':{all:[7,3]},'Tall Grass':{all:[8,3]},
    'Crafting Table':{top:[11,2],side:[12,2],front:[13,2]},Furnace:{front:[12,3],side:[13,3],top:[14,3],bottom:[14,3]},
    'Oak Door':{all:[1,5]},Ladder:{all:[3,5]},'Iron Door':{all:[2,5]},
    Snow:{all:[2,4]},'Snow Block':{all:[2,4]},Ice:{all:[3,4]},Cactus:{top:[5,4],side:[6,4],bottom:[7,4]},Clay:{all:[8,4]},
    Netherrack:{all:[7,6]},'Soul Sand':{all:[8,6]},Glowstone:{all:[9,6]},'Nether Portal':{all:[14,0]},
    'Jack o Lantern':{all:[7,7]},'Jack o\'Lantern':{all:[7,7]},'End Stone':{all:[15,10]},Water:{all:[13,12]},Lava:{all:[15,12]}
  });

  class DorukCraftPacks {
    constructor(options) {
      this.blocks = options.blocks || [];
      this.items = options.items || [];
      this.baseAtlas = options.baseAtlas;
      this.baseItems = options.baseItems;
      this.baseOpaqueItems = options.baseOpaqueItems;
      this.onApply = options.onApply || (() => {});
      this.onStatus = options.onStatus || (() => {});
      this.current = null;
    }

    status(text) { this.onStatus(String(text)); }

    async restore() {
      let data;
      try { data = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch {}
      if (!data?.atlas) return false;
      this.current = data;
      await this.onApply(data);
      this.status(`Active: ${data.name || 'Custom Pack'}`);
      return true;
    }

    async reset() {
      localStorage.removeItem(STORE_KEY);
      this.current = null;
      await this.onApply(null);
      this.status('Active: Modern Textures (default)');
    }

    save(pack) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(pack)); }
      catch { this.status('Pack applied, but it was too large to remember after closing.'); }
    }

    async useBuiltInLegacy() {
      const [atlas, items, opaqueItems, particles] = await Promise.all([
        imageFromURL('./assets/images/eb2d3fcf1631a3e8fbbf.png'),
        imageFromURL('./assets/images/1017b4b960948aa4e668.png'),
        imageFromURL('./assets/images/ab14bcfa9f066a5a6cc6.png'),
        imageFromURL('./assets/images/99212086c27ac1acfb86.png')
      ]);
      const pack={name:'Legacy Textures',format:'doruk-built-in-legacy',atlas:this.toDataURL(atlas),items:this.toDataURL(items),opaqueItems:this.toDataURL(opaqueItems),particles:this.toDataURL(particles),importedAt:Date.now()};
      await this.apply(pack);
      return pack;
    }
    async useBuiltInClassic() { return this.useBuiltInLegacy(); }

    async importFile(file) {
      if (!file) throw new Error('Choose a PNG, ZIP, MCPACK, or MCPE texture pack.');
      if (file.size > 64 * 1024 * 1024) throw new Error('Texture packs are limited to 64 MB on mobile.');
      const lower = file.name.toLowerCase();
      let pack;
      if (lower.endsWith('.png')) {
        const image = await imageFromBlob(file);
        if (image.naturalWidth === 512 && image.naturalHeight === 256) {
          pack = { name:file.name, format:'doruk-atlas', atlas:this.toDataURL(image), items:null, importedAt:Date.now() };
        } else if (image.naturalWidth === 256 && image.naturalHeight === 256) {
          pack = await this.fromLegacy(image, null, file.name);
        } else throw new Error('Atlas PNGs must be 512×256, or a legacy terrain.png must be 256×256.');
      } else {
        if (!globalThis.JSZip) throw new Error('ZIP support did not load.');
        const zip = await globalThis.JSZip.loadAsync(file);
        pack = await this.fromZip(zip, file.name);
      }
      await this.apply(pack);
      return pack;
    }

    toDataURL(image) {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth || image.width;
      canvas.height = image.naturalHeight || image.height;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, 0, 0);
      return canvas.toDataURL('image/png');
    }

    async baseCanvases() {
      const [atlasImage, itemImage, opaqueItemImage] = await Promise.all([imageFromURL(this.baseAtlas), imageFromURL(this.baseItems), imageFromURL(this.baseOpaqueItems || this.baseItems)]);
      const atlas = document.createElement('canvas'); atlas.width = 512; atlas.height = 256;
      const items = document.createElement('canvas'); items.width = 256; items.height = 256;
      const opaqueItems = document.createElement('canvas'); opaqueItems.width = 256; opaqueItems.height = 256;
      atlas.getContext('2d').drawImage(atlasImage, 0, 0, 512, 256);
      items.getContext('2d').drawImage(itemImage, 0, 0, 256, 256);
      opaqueItems.getContext('2d').drawImage(opaqueItemImage, 0, 0, 256, 256);
      return { atlas, items, opaqueItems };
    }

    async fromLegacy(terrain, legacyItems, name) {
      const { atlas, items, opaqueItems } = await this.baseCanvases();
      const ctx = atlas.getContext('2d');
      for (const block of this.blocks) {
        const map = LEGACY[block.name];
        if (!map) continue;
        for (const kind of ['all','top','side','bottom','front']) {
          const source = map[kind] || map.all;
          const dest = block[kind] || block.all;
          if (!source || !dest) continue;
          drawFrame(ctx, { image:terrain, sx:source[0]*16, sy:source[1]*16, sw:16, sh:16 }, dest[0]*16, dest[1]*16);
        }
      }
      if (legacyItems) {
        const itemCtx = items.getContext('2d');
        itemCtx.clearRect(0,0,256,256);itemCtx.imageSmoothingEnabled=false;itemCtx.drawImage(legacyItems,0,0,256,256);
        const opaqueCtx = opaqueItems.getContext('2d');
        opaqueCtx.clearRect(0,0,256,256);opaqueCtx.imageSmoothingEnabled=false;opaqueCtx.drawImage(legacyItems,0,0,256,256);
      }
      return { name, format:'legacy-terrain', atlas:atlas.toDataURL('image/png'), items:items.toDataURL('image/png'), opaqueItems:opaqueItems.toDataURL('image/png'), importedAt:Date.now() };
    }

    findEntry(entries, candidates, category) {
      const prefixes = category === 'item'
        ? ['assets/minecraft/textures/item/','assets/minecraft/textures/items/','textures/items/','textures/item/','item/','items/']
        : ['assets/minecraft/textures/block/','assets/minecraft/textures/blocks/','textures/blocks/','textures/block/','blocks/','block/'];
      for (const candidate of candidates) {
        const clean = String(candidate).toLowerCase().replace(/\.png$/,'');
        for (const prefix of prefixes) {
          const wanted = `${prefix}${clean}.png`;
          const exact = entries.find(entry => entry.path === wanted || entry.path.endsWith(`/${wanted}`));
          if (exact) return exact;
        }
      }
      return null;
    }

    async entryImage(entry) {
      return imageFromBlob(await entry.file.async('blob'));
    }

    candidatesFor(block, kind) {
      const override = OVERRIDES[block.name] || {};
      if (override[kind]) return override[kind];
      if (override.all) return override.all;
      const base = slug(block.name);
      const variants = kind === 'all' ? [base] : [`${base}_${kind}`, base];
      if (kind === 'side') variants.unshift(`${base}_side0`);
      if (kind === 'front') variants.unshift(`${base}_front_off`);
      return variants;
    }

    async fromZip(zip, name) {
      const entries = Object.values(zip.files).filter(file => !file.dir).map(file => ({ file, path:file.name.toLowerCase().replaceAll('\\','/') }));
      const directTerrain = entries.find(entry => /(^|\/)terrain\.png$/.test(entry.path));
      const directItems = entries.find(entry => /(^|\/)items\.png$/.test(entry.path));
      const directParticles = entries.find(entry => /(^|\/)(?:textures\/particle\/)?particles\.png$/.test(entry.path));
      const particles = directParticles ? this.toDataURL(await this.entryImage(directParticles)) : null;
      if (directTerrain) {
        const terrain = await this.entryImage(directTerrain);
        if (terrain.naturalWidth === 256 && terrain.naturalHeight === 256) {
          const pack = await this.fromLegacy(terrain, directItems ? await this.entryImage(directItems) : null, name);
          pack.particles = particles;
          return pack;
        }
        if (terrain.naturalWidth === 512 && terrain.naturalHeight === 256) {
          const itemAtlas = directItems ? this.toDataURL(await this.entryImage(directItems)) : null;
          return { name, format:'doruk-atlas-zip', atlas:this.toDataURL(terrain), items:itemAtlas, opaqueItems:itemAtlas, particles, importedAt:Date.now() };
        }
      }

      const { atlas, items, opaqueItems } = await this.baseCanvases();
      const atlasCtx = atlas.getContext('2d'), itemCtx = items.getContext('2d'), opaqueItemCtx = opaqueItems.getContext('2d');
      let blocksChanged = 0, itemsChanged = 0;
      for (const block of this.blocks) {
        for (const kind of ['all','top','side','bottom','front']) {
          const dest = block[kind] || (kind === 'all' ? block.all : null);
          if (!dest) continue;
          const entry = this.findEntry(entries, this.candidatesFor(block, kind), 'block');
          if (!entry) continue;
          drawFrame(atlasCtx, firstFrame(await this.entryImage(entry)), dest[0]*16, dest[1]*16);
          blocksChanged++;
        }
      }
      for (const item of this.items) {
        const base = slug(item.name);
        const entry = this.findEntry(entries, [base, base.replace('cooked_','cooked_'), base.replace('potion_of_','potion_')], 'item');
        if (!entry || !Number.isFinite(item.itemX) || !Number.isFinite(item.itemY)) continue;
        drawFrame(item.sheet === 'opaque' ? opaqueItemCtx : itemCtx, firstFrame(await this.entryImage(entry)), item.itemX*16, item.itemY*16);
        itemsChanged++;
      }
      if (!blocksChanged && !itemsChanged) throw new Error('No compatible block/item textures were found in this pack.');
      return { name, format:'java-or-bedrock-zip', atlas:atlas.toDataURL('image/png'), items:items.toDataURL('image/png'), opaqueItems:opaqueItems.toDataURL('image/png'), particles, importedAt:Date.now(), blocksChanged, itemsChanged };
    }

    async apply(pack) {
      this.current = pack;
      this.save(pack);
      await this.onApply(pack);
      const count = (pack.blocksChanged || 0) + (pack.itemsChanged || 0);
      this.status(`Active: ${pack.name}${count ? ` • ${count} textures mapped` : ''}`);
    }
  }

  globalThis.DorukCraftPacks = DorukCraftPacks;
})();

