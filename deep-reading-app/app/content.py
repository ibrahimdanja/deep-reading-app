"""
Pulls short pieces to read, from a small set of free, no-key-needed sources:

- arXiv (science/AI/physics) — via their search API
- Aeon (philosophy/ideas essays) — via RSS. Aeon only publishes one combined
  feed, not one per topic, so this stays a broad "philosophy & ideas" pool.
- PubMed (psychology/nursing/sociology/medical research) — via NCBI's
  E-utilities, genuinely filtered per topic via different search terms.
- Wikipedia's "On This Day" API (history) — real historical events for
  today's date, from Wikimedia's official free REST API.
"""

import datetime
import random
import xml.etree.ElementTree as ET

import feedparser
import requests

HEADERS = {"User-Agent": "deep-reading-app/0.1 (personal project)"}

# ---------------------------------------------------------------------------
# arXiv (science)
# ---------------------------------------------------------------------------

ARXIV_API_URL = "http://export.arxiv.org/api/query"
ARXIV_CATEGORIES = [
    "physics.gen-ph",
    "q-bio.NC",
    "cs.AI",
    "physics.soc-ph",
]


def _fetch_arxiv_piece() -> dict:
    category = random.choice(ARXIV_CATEGORIES)
    params = {
        "search_query": f"cat:{category}",
        "sortBy": "submittedDate",
        "sortOrder": "descending",
        "max_results": 20,
    }
    response = requests.get(ARXIV_API_URL, params=params, headers=HEADERS, timeout=15)
    response.raise_for_status()

    feed = feedparser.parse(response.text)
    if not feed.entries:
        raise RuntimeError(f"arXiv returned no entries for '{category}'")

    entry = random.choice(feed.entries)
    return {
        "title": " ".join(entry.title.split()),
        "summary": " ".join(entry.summary.split()),
        "url": entry.link,
        "source": f"arXiv ({category})",
    }


# ---------------------------------------------------------------------------
# Aeon (philosophy / ideas)
# ---------------------------------------------------------------------------

AEON_RSS_URL = "https://aeon.co/feed.rss"


def _fetch_aeon_piece() -> dict:
    response = requests.get(AEON_RSS_URL, headers=HEADERS, timeout=15)
    response.raise_for_status()

    feed = feedparser.parse(response.text)
    if not feed.entries:
        raise RuntimeError("Aeon's feed returned no entries")

    entry = random.choice(feed.entries[:15])
    import re
    summary = re.sub("<[^<]+?>", "", entry.summary)
    summary = " ".join(summary.split())

    return {
        "title": " ".join(entry.title.split()),
        "summary": summary,
        "url": entry.link,
        "source": "Aeon (philosophy & ideas)",
    }


# ---------------------------------------------------------------------------
# PubMed (psychology / nursing / sociology / medical)
# ---------------------------------------------------------------------------

PUBMED_ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
PUBMED_EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"


def _fetch_pubmed_piece(topic_label: str, search_term: str) -> dict:
    search_params = {
        "db": "pubmed",
        "term": search_term,
        "retmode": "json",
        "retmax": 20,
        "sort": "date",
    }
    search_resp = requests.get(
        PUBMED_ESEARCH_URL, params=search_params, headers=HEADERS, timeout=15
    )
    search_resp.raise_for_status()
    id_list = search_resp.json().get("esearchresult", {}).get("idlist", [])
    if not id_list:
        raise RuntimeError(f"PubMed returned no results for '{search_term}'")

    pmid = random.choice(id_list)

    fetch_params = {
        "db": "pubmed",
        "id": pmid,
        "rettype": "abstract",
        "retmode": "xml",
    }
    fetch_resp = requests.get(
        PUBMED_EFETCH_URL, params=fetch_params, headers=HEADERS, timeout=15
    )
    fetch_resp.raise_for_status()

    root = ET.fromstring(fetch_resp.text)
    title_el = root.find(".//ArticleTitle")
    title = "".join(title_el.itertext()).strip() if title_el is not None else "(untitled)"

    abstract_parts = [
        "".join(el.itertext()).strip() for el in root.findall(".//AbstractText")
    ]
    summary = " ".join(abstract_parts).strip()
    if not summary:
        raise RuntimeError(f"PubMed article {pmid} had no abstract text")

    return {
        "title": title,
        "summary": summary,
        "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
        "source": f"PubMed ({topic_label})",
    }


# ---------------------------------------------------------------------------
# Wikipedia "On This Day" (history)
# ---------------------------------------------------------------------------

WIKI_ONTHISDAY_URL = "https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{month}/{day}"


def _fetch_history_piece() -> dict:
    today = datetime.date.today()
    url = WIKI_ONTHISDAY_URL.format(month=f"{today.month:02d}", day=f"{today.day:02d}")

    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    events = response.json().get("events", [])
    if not events:
        raise RuntimeError("Wikipedia's On This Day API returned no events")

    event = random.choice(events)
    year = event.get("year", "?")
    text = event.get("text", "").strip()

    # Prefer the linked Wikipedia page's own extract for a fuller "piece",
    # falling back to just the event line if no linked page is present.
    pages = event.get("pages") or []
    page = pages[0] if pages else None

    if page:
        title = page.get("normalizedtitle") or page.get("title") or text
        summary = page.get("extract") or text
        url_out = (
            page.get("content_urls", {}).get("desktop", {}).get("page")
            or f"https://en.wikipedia.org/wiki/{page.get('title', '')}"
        )
    else:
        title = text
        summary = text
        url_out = "https://en.wikipedia.org"

    return {
        "title": f"{year} — {title}",
        "summary": summary,
        "url": url_out,
        "source": "Wikipedia (On This Day)",
    }


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

CATEGORIES = {
    "science": "Science",
    "philosophy": "Philosophy & Ideas",
    "psychology": "Psychology",
    "nursing": "Nursing",
    "biology": "Biology",
    "sociology": "Sociology",
    "history": "History",
    "medical": "Medical",
}


def get_piece(category: str = "science") -> dict:
    if category == "science":
        return _fetch_arxiv_piece()
    if category == "philosophy":
        return _fetch_aeon_piece()
    if category == "psychology":
        return _fetch_pubmed_piece("psychology", "psychology")
    if category == "nursing":
        return _fetch_pubmed_piece("nursing", "nursing")
    if category == "biology":
        return _fetch_pubmed_piece("biology", "biology")
    if category == "sociology":
        return _fetch_pubmed_piece("sociology", "sociology")
    if category == "medical":
        return _fetch_pubmed_piece("medical", "clinical medicine")
    if category == "history":
        return _fetch_history_piece()

    raise ValueError(f"Unknown category: {category}")