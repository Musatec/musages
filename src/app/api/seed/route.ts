import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Copier le logo horizontal horizontal TaleemApp (Icône à gauche + Taleem (blanc) App (vert))
    const srcLogo = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\a7617325-4504-4608-912e-d860715898d9\\logo_taleem_horizontal_1785605435746.png';
    const publicLogo = path.join(process.cwd(), 'public', 'logo-taleem.png');
    const publicLogo2 = path.join(process.cwd(), 'public', 'logo.png');

    if (fs.existsSync(srcLogo)) {
      fs.copyFileSync(srcLogo, publicLogo);
      fs.copyFileSync(srcLogo, publicLogo2);
    }

    return NextResponse.json({
      success: true,
      message: "Logo horizontal TaleemApp copié avec succès dans public !"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
  }
}
