export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 mt-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 px-6">
        <div>
          <h4 className="text-emerald-300 font-semibold mb-3">
            Seva Sanjeevani
          </h4>
          <p className="text-slate-400 text-sm">
            Ayurveda for mindful living. Pure, herbal and rooted in tradition.
          </p>
        </div>

        <div>
          <h4 className="text-emerald-300 font-semibold mb-3">Shop</h4>
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>Immunity Boosters</li>
            <li>Stress & Sleep</li>
            <li>Digestive Care</li>
            <li>Skin & Hair</li>
          </ul>
        </div>

        <div>
          <h4 className="text-emerald-300 font-semibold mb-3">Support</h4>
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>Help Center</li>
            <li>Shipping & Returns</li>
            <li>Privacy Policy</li>
            <li>Terms of Use</li>
          </ul>
        </div>

        <div>
          <h4 className="text-emerald-300 font-semibold mb-3">Stay connected</h4>
          <ul className="space-y-1 text-slate-400 text-sm">
            <li>Instagram</li>
            <li>YouTube</li>
            <li>Facebook</li>
          </ul>
        </div>
      </div>

      <p className="text-center text-slate-600 text-xs mt-8">
        © {new Date().getFullYear()} Seva Sanjeevani. All Rights Reserved.
      </p>
    </footer>
  );
}
