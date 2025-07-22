'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, X, FileText, BarChart3, Settings } from 'lucide-react';
import { AgentConfigView } from './AgentConfigView';
import { DataTable } from './DataTable';

interface TableData {
  headers: string[];
  rows: any[];
  total_rows: number;
  downloadable: boolean;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  tableData?: TableData;
}

interface NCCAgentChatProps {
  onClose: () => void;
}

export function NCCAgentChat({ onClose }: NCCAgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your NCC (Net Cash Contribution) agent. I can help you analyze your consulting firm\'s financial data, track performance across regions and sectors, and provide strategic insights. What would you like to know?',
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadContent, setUploadContent] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ncc-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputMessage, action: 'chat' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Sorry, I encountered an error processing your request.',
        sender: 'agent',
        timestamp: new Date(),
        tableData: data.table_data || undefined
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I\'m having trouble connecting to the backend. Please make sure the NCC API is running.',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFilename || !uploadContent) {
      alert('Please provide both filename and content');
      return;
    }

    try {
      const response = await fetch('/api/ncc-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'upload',
          filename: uploadFilename,
          content: uploadContent,
          type: 'business_doc'
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        const uploadMessage: Message = {
          id: Date.now().toString(),
          content: `✅ Successfully uploaded "${uploadFilename}" to knowledge base. You can now ask me questions about this document!`,
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, uploadMessage]);
        setShowUpload(false);
        setUploadContent('');
        setUploadFilename('');
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const quickQuestions = [
    "What are our top performing regions?",
    "How is the Industrial Goods sector performing?", 
    "Show me NCC trends by office",
    "What recommendations do you have for improving performance?"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#1B4332] text-white p-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">NCC Agent</h2>
              <p className="text-sm opacity-90">Net Cash Contribution Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(true)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="View Agent Configuration"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Upload Knowledge Base Document"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Panel */}
        {showUpload && (
          <div className="bg-gray-50 p-4 border-b">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload Document to Knowledge Base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Filename (e.g., strategy.txt)"
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                className="px-3 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Document content..."
                value={uploadContent}
                onChange={(e) => setUploadContent(e.target.value)}
                className="px-3 py-2 border rounded-lg md:col-span-2"
                rows={2}
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#0f2419] transition-colors"
              >
                Upload Document
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.tableData && (
                  <div className="mt-3">
                    <DataTable 
                      data={message.tableData} 
                      title={`Analysis Results (${message.timestamp.toLocaleDateString()})`} 
                    />
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1B4332]"></div>
                  <span>Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 border-t bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Try these questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(question)}
                  className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about NCC performance, regions, sectors..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-[#1B4332] text-white rounded-lg hover:bg-[#0f2419] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Agent Configuration View */}
      {showConfig && (
        <AgentConfigView onClose={() => setShowConfig(false)} />
      )}
    </div>
  );
}