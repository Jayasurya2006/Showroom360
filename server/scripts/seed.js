require('dotenv').config();
const mongoose = require('mongoose'), bcrypt = require('bcryptjs');
const { User, Product, Sale, StockMovement, Settings } = require('../models');
const rows = [
['Leather Sofa 3-Seater','Furniture','Urban Loft',42000,28000,6],['Oak Dining Table','Furniture','Urban Loft',31000,20000,4],['Study Desk','Furniture','Nilkamal',9500,6000,12],
['Queen Bed Frame','Furniture','Godrej',24500,16000,3],['Wardrobe 3-Door','Furniture','Godrej',18900,12000,0],['Bookshelf Walnut','Furniture','Nilkamal',7200,4500,2],
['Split AC 1.5 Ton','Appliances','Voltas',38900,29000,9],['Front Load Washer 7kg','Appliances','LG',33500,25000,5],['Refrigerator 260L','Appliances','Samsung',28900,21500,1],
['Microwave Oven 25L','Appliances','IFB',9800,7000,14],['Air Purifier','Appliances','Philips',12400,8800,0],['Water Heater 15L','Appliances','Bajaj',6900,4800,18],
['LED TV 43 inch','Electronics','Sony',41900,33000,7],['Soundbar 2.1','Electronics','Boat',5400,3300,20],['Smart Speaker','Electronics','Amazon',3999,2800,3],
['Laptop 14 inch','Electronics','HP',58900,48000,8],['Table Lamp','Decor','Havells',1850,900,25],['Wall Clock','Decor','Ajanta',1250,600,2],
['Area Rug 5x7','Decor','Jaipur Looms',6700,3900,10],['Curtain Set','Decor','Story@Home',2400,1300,30],['Cookware Set 7pc','Kitchen','Prestige',4800,3000,16],['Dinner Set 24pc','Kitchen','Borosil',3600,2100,4]];
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const { OWNER_EMAIL, OWNER_PASSWORD, OWNER_NAME } = process.env;
  if (!OWNER_EMAIL || !OWNER_PASSWORD) throw new Error('Set OWNER_EMAIL and OWNER_PASSWORD in .env');
  await User.updateOne({ email: OWNER_EMAIL.toLowerCase() }, { name: OWNER_NAME || 'Owner', password: await bcrypt.hash(OWNER_PASSWORD, 10), role: 'OWNER', active: true }, { upsert: true });
  if (!(await Settings.countDocuments())) await Settings.create({});
  if (!(await Product.countDocuments())) {
    const ps = await Product.insertMany(rows.map((r, i) => ({ sku: 'SKU' + (1001 + i), name: r[0], category: r[1], brand: r[2], price: r[3], purchasePrice: r[4], qty: r[5], threshold: 5, description: `${r[0]} by ${r[2]}` })));
    await StockMovement.insertMany(ps.map(p => ({ product: p._id, name: p.name, change: p.qty, reason: 'OPENING', balance: p.qty })));
    const pw = await bcrypt.hash('Client@1234', 10);
    const cl = await User.insertMany([{ name: 'Anita Rao', email: 'anita@example.com', password: pw }, { name: 'Karthik S', email: 'karthik@example.com', password: pw }]);
    let n = 1;
    for (const [c, pi, d] of [[cl[0], 13, 2], [cl[1], 17, 5], [cl[0], 19, 9], [null, 14, 1]]) {
      const p = ps[pi], tax = Math.round(p.price * 0.18 * 100) / 100;
      await Sale.create({ invoiceNo: `INV-SEED-${String(n++).padStart(4, '0')}`, customer: c?._id, customerName: c?.name, items: [{ product: p._id, name: p.name, sku: p.sku, qty: 1, price: p.price }],
        subtotal: p.price, discount: 0, tax, total: p.price + tax, payment: 'UPI', createdAt: new Date(Date.now() - d * 864e5) });
    }
  }
  console.log('Seed complete'); process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
