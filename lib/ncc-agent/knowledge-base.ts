// Knowledge base system for NCC Agent - simplified for Vercel deployment
import fs from 'fs';
import path from 'path';

interface Document {
  id: string;
  filename: string;
  content: string;
  type: string;
  created_at: Date;
}

export class KnowledgeBase {
  private documents: Map<string, Document> = new Map();

  constructor() {
    // Initialize with default business documents
    this.addDocument('company_strategy.txt', `Our consulting firm focuses on three key strategic priorities:
1. Digital transformation in Industrial Goods sector
2. Cost optimization for EMESA region clients  
3. Revenue growth in Asia Pacific markets

Key metrics to track:
- NCC growth target: 15% YoY
- Client retention rate: 90%+
- Cross-selling opportunities in TMT sector`, 'strategy_doc');

    this.addDocument('ncc_targets.txt', `Q1 2024 NCC TARGETS BY REGION:

Asia Pacific: $2.5M target (currently $2.48M - 99% achieved)
- Singapore office: Exceed expectations in Industrial Goods
- Sydney office: Strong performance across all sectors

EMESA: $1.8M target (currently $1.89M - 105% achieved)
- Munich office: Leading TMT initiatives  
- London office: Financial institutions focus

North America: $1.9M target (currently $1.86M - 98% achieved)

RISK FACTORS:
- Adjustments averaging -2.1% impact on NCC
- Client_3 showing negative adjustments trend

OPPORTUNITIES:
- Cross-selling TMT services to Industrial Goods clients
- Expanding Financial Institutions practice globally`, 'targets_doc');
  }

  addDocument(filename: string, content: string, type: string = 'business_doc') {
    const doc: Document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename,
      content,
      type,
      created_at: new Date()
    };

    this.documents.set(doc.id, doc);
    return { status: 'success', id: doc.id };
  }

  searchDocuments(query: string): Document[] {
    const queryLower = query.toLowerCase();
    const results: Document[] = [];

    for (const doc of this.documents.values()) {
      if (doc.content.toLowerCase().includes(queryLower) || 
          doc.filename.toLowerCase().includes(queryLower)) {
        results.push(doc);
      }
    }

    return results.sort((a, b) => {
      // Simple relevance scoring based on query matches
      const aMatches = (a.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
      const bMatches = (b.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
      return bMatches - aMatches;
    });
  }

  getContextForQuery(query: string, maxDocs: number = 2): string {
    const relevantDocs = this.searchDocuments(query).slice(0, maxDocs);
    
    if (relevantDocs.length === 0) {
      return 'No relevant documents found in knowledge base.';
    }

    return relevantDocs
      .map(doc => `=== From ${doc.filename} ===\n${doc.content}\n`)
      .join('\n');
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  deleteDocument(id: string) {
    const deleted = this.documents.delete(id);
    return { 
      status: deleted ? 'success' : 'error',
      message: deleted ? 'Document deleted' : 'Document not found'
    };
  }
}