import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Download, Terminal, Settings, CheckCircle2, FileCode2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function App() {
  const [url, setUrl] = useState('https://example.com/reports');
  const [outputDir, setOutputDir] = useState('downloaded_pdfs');
  const [delay, setDelay] = useState(1);
  const [copied, setCopied] = useState(false);

  const pythonCode = `import os
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def download_pdfs(base_url, output_dir="${outputDir}", delay=${delay}):
    """
    Scrapes and downloads all PDF files found on the given URL.
    """
    # Create directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Set headers to mimic a browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }

    print(f"[*] Fetching {base_url}...")
    try:
        response = requests.get(base_url, headers=headers, timeout=15)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"[!] Error fetching URL: {e}")
        return

    soup = BeautifulSoup(response.text, 'html.parser')
    links = soup.find_all('a')

    pdf_urls = set()
    for link in links:
        href = link.get('href')
        if href and href.lower().endswith('.pdf'):
            full_url = urljoin(base_url, href)
            pdf_urls.add(full_url)

    if not pdf_urls:
        print("[-] No PDFs found on the page.")
        return

    print(f"[+] Found {len(pdf_urls)} PDF(s). Starting download...")

    for i, pdf_url in enumerate(pdf_urls, 1):
        # Extract filename from URL
        parsed_url = urlparse(pdf_url)
        filename = os.path.basename(parsed_url.path)
        if not filename:
            filename = f"document_{i}.pdf"

        filepath = os.path.join(output_dir, filename)

        print(f"[{i}/{len(pdf_urls)}] Downloading {filename}...")
        try:
            pdf_response = requests.get(pdf_url, headers=headers, timeout=30)
            pdf_response.raise_for_status()

            with open(filepath, 'wb') as f:
                f.write(pdf_response.content)

            if delay > 0 and i < len(pdf_urls):
                time.sleep(delay)

        except requests.exceptions.RequestException as e:
            print(f"[!] Failed to download {filename}: {e}")

if __name__ == "__main__":
    TARGET_URL = "${url}"
    download_pdfs(TARGET_URL)
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pdf_scraper.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30">
      <div className="max-w-7xl mx-auto p-6 lg:p-12">
        
        {/* Header */}
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 flex items-center gap-3">
              <Terminal className="w-8 h-8 text-emerald-400" />
              Python PDF Scraper
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">
              Configure and generate a robust Python script to extract PDFs from any webpage.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/50">
            <FileCode2 className="w-4 h-4" />
            <span>Requires: requests, beautifulsoup4</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Configuration Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-6 text-zinc-100 font-medium">
                <Settings className="w-5 h-5 text-zinc-400" />
                <h2>Configuration</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                    Target URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    placeholder="https://example.com/reports"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                    Output Directory
                  </label>
                  <input
                    type="text"
                    value={outputDir}
                    onChange={(e) => setOutputDir(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    placeholder="downloaded_pdfs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                    Delay Between Downloads (s)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={delay}
                      onChange={(e) => setDelay(parseFloat(e.target.value))}
                      className="flex-1 accent-emerald-500"
                    />
                    <span className="text-sm font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md min-w-[3rem] text-center">
                      {delay}s
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Helps prevent getting blocked by the server.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-6">
              <h3 className="text-sm font-medium text-emerald-400 mb-3">Quick Start Guide</h3>
              <ol className="text-sm text-zinc-400 space-y-3 list-decimal list-inside">
                <li>Install Python 3.8+ on your system.</li>
                <li>
                  Install dependencies:
                  <code className="block mt-2 bg-black/40 px-3 py-2 rounded-lg font-mono text-xs text-emerald-300 border border-emerald-900/50">
                    pip install requests beautifulsoup4
                  </code>
                </li>
                <li>Download or copy the script.</li>
                <li>Run it from your terminal: <code className="text-emerald-300">python scraper.py</code></li>
              </ol>
            </div>
          </motion.div>

          {/* Code Preview Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 flex flex-col h-full"
          >
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/50">
              
              {/* Code Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 text-xs font-mono text-zinc-500">scraper.py</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm shadow-emerald-500/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .py
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <div className="flex-1 overflow-auto bg-[#1E1E1E] p-4 text-sm">
                <SyntaxHighlighter
                  language="python"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: 0,
                    background: 'transparent',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                  }}
                  showLineNumbers={true}
                  lineNumberStyle={{ minWidth: '3em', paddingRight: '1em', color: '#6e7681', textAlign: 'right' }}
                >
                  {pythonCode}
                </SyntaxHighlighter>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
