import os
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

def download_pdfs(base_url, output_dir="downloaded_pdfs", delay=2):
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
    TARGET_URL = "https://third.circuit.mec.ms.gov/doc2/89811334483"
    download_pdfs(TARGET_URL)
