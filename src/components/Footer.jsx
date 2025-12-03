export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 mt-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-6">
        {/* Brand */}
        <div>
          <h4 className="text-emerald-300 font-semibold mb-3">
            Seva Sanjeevani
          </h4>
          <p className="text-slate-400 text-sm">
            Ayurveda for mindful living. Pure, herbal and rooted in tradition.
            Discover remedies crafted to balance body, mind and spirit.
          </p>
          <p className="text-slate-500 text-xs mt-4 leading-relaxed">
            Address: 21/4, Ayurvedic Lane, Basavanagudi, Bengaluru, Karnataka
            560004, India
            <br />
            Email: care@sevasanjeevani.in
            <br />
            Phone: +91‑98765‑43210
          </p>
        </div>

        {/* Shop */}
        <div>
          <h4 className="text-emerald-300 font-semibold mb-3">Shop</h4>
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>Immunity Boosters</li>
            <li>Stress &amp; Sleep</li>
            <li>Digestive Care</li>
            <li>Skin &amp; Hair</li>
            <li>Women&apos;s Health</li>
            <li>Kids Care</li>
            <li>All Products</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-emerald-300 font-semibold mb-3">Support</h4>
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>Help Center</li>
            <li>Shipping &amp; Returns</li>
            <li>Order Tracking</li>
            <li>Privacy Policy</li>
            <li>Terms of Use</li>
            <li>Contact Us</li>
          </ul>
        </div>

        {/* Social / Stay connected */}
        <div>
          <h4 className="text-emerald-300 font-semibold mb-3">
            Stay connected
          </h4>
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>Instagram</li>
            <li>YouTube</li>
            <li>Facebook</li>
            <li>Twitter / X</li>
            <li>WhatsApp Community</li>
            <li>Newsletter</li>
          </ul>
        </div>
      </div>

      <p className="text-center text-slate-600 text-xs mt-8 px-4">
        © {new Date().getFullYear()} Seva Sanjeevani. All Rights Reserved. Not
        intended to diagnose, treat, cure, or prevent any disease. Always
        consult your physician for chronic conditions.
      </p>
    </footer>
  );
}
