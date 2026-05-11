import os
import chromadb
from chromadb.utils import embedding_functions

TANANYAG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'tananyag')

TANTARGYAK = {
    'internet_tortenete': 'internet_tortenete.txt',
    'foldrajz': 'foldrajz.txt',
    'biologia': 'biologia.txt',
}

_client = None
_collection = None

def get_collection():
    global _client, _collection
    if _collection is not None:
        return _collection

    _client = chromadb.Client()
    ef = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name='paraphrase-multilingual-MiniLM-L12-v2'
    )
    _collection = _client.get_or_create_collection('tananyag', embedding_function=ef)

    if _collection.count() == 0:
        _betolt_tananyag(_collection)

    return _collection


def _betolt_tananyag(collection):
    dokumentumok = []
    id_lista = []
    metaadatok = []

    for tantargy, fajlnev in TANTARGYAK.items():
        eleresi_ut = os.path.join(TANANYAG_DIR, fajlnev)
        if not os.path.exists(eleresi_ut):
            continue

        with open(eleresi_ut, encoding='utf-8') as f:
            tartalom = f.read()

        # Bekezdésekre bontjuk
        bekezdesek = [b.strip() for b in tartalom.split('\n\n') if len(b.strip()) > 50]

        for i, bekezdes in enumerate(bekezdesek):
            dokumentumok.append(bekezdes)
            id_lista.append(f'{tantargy}_{i}')
            metaadatok.append({'tantargy': tantargy})

    if dokumentumok:
        collection.add(documents=dokumentumok, ids=id_lista, metadatas=metaadatok)


TANTARGY_NEVEK = {
    'Az internet története': 'internet_tortenete',
    'Földrajz': 'foldrajz',
    'Biológia': 'biologia',
}

def kereses(kerdes: str, n_results: int = 3, tantargy: str = None) -> str:
    collection = get_collection()
    where = {'tantargy': TANTARGY_NEVEK[tantargy]} if tantargy and tantargy in TANTARGY_NEVEK else None
    eredmenyek = collection.query(
        query_texts=[kerdes],
        n_results=n_results,
        where=where if where else None
    )
    dokumentumok = eredmenyek.get('documents', [[]])[0]
    return '\n\n'.join(dokumentumok)
