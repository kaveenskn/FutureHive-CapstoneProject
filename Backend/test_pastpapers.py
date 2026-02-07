from pastMongo import load_collections

if __name__ == "__main__":
    research_docs, capstone_docs = load_collections()

    print("\n===== TEST OUTPUT =====")
    print(f"Research docs count: {len(research_docs)}")
    print(f"Capstone docs count: {len(capstone_docs)}")

    if research_docs:
        print("\nSample Research Document:")
        print(research_docs[0])

    if capstone_docs:
        print("\nSample Capstone Document:")
        print(capstone_docs[0])
