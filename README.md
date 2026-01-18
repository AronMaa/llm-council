# LLM Council - Collaborative AI Decision Making

## Group Information
- **Group Members**: Aron Maarek
- **TD Group Number**: CDOF3

## Project Overview

The LLM Council is an innovative AI system that employs a multi-stage decision-making process using multiple Large Language Models (LLMs) working collaboratively. Instead of relying on a single AI model, this system creates a "council" of different models that debate, evaluate, and synthesize responses to produce higher-quality answers.

### Key Features:
- **Three-Stage Process**: Individual responses → Peer ranking → Final synthesis
- **Parallel Processing**: All models respond simultaneously for efficiency
- **Anonymized Evaluation**: Models rank responses without knowing which model produced them
- **Consensus Building**: Chairman model synthesizes the best insights from all responses
- **Real-time Streaming**: Watch the council deliberation process unfold

## Setup and Installation

### Prerequisites
- Python 3.8+
- Ollama installed locally
- At least 8GB RAM (16GB recommended)

### Step 1: Install Ollama and Models
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull the required models
ollama pull llama3
ollama pull mistral
ollama pull phi3
```

### Step 2: Set Up Python Environment
```bash
# Clone the repository
git clone https://github.com/AronMaa/llm-council.git
cd llm-council

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn aiohttp requests pydantic
```

### Step 3: Configure the System
Edit `config.py` if needed:
```python
# Default configuration uses local Ollama on port 11434
# Modify if your setup differs
COUNCIL_MODELS = [
    {"name": "llama3", "url": "http://127.0.0.1:11434"},
    {"name": "mistral", "url": "http://127.0.0.1:11434"},
    {"name": "phi3", "url": "http://127.0.0.1:11434"},
]
```

## Running the Demo

### Step 1: Start Ollama
```bash
# Make sure Ollama is running
ollama serve
```

### Step 2: Start the Backend Server
```bash
python main.py
```
Server will start at: http://localhost:8001

### Step 3: Start the Frontend (if available)
```bash
# If you have a React/Vue frontend
cd frontend
npm install
npm run dev
```
Frontend will typically start at: http://localhost:5173 or http://localhost:3000

### Step 4: Access the Application
Open your browser and navigate to:
- Backend API: http://localhost:8001
- Frontend UI: http://localhost:5173 (if frontend is set up)

## API Endpoints

### Main Endpoints:
- `GET /` - Health check
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/{id}` - Get specific conversation
- `POST /api/conversations/{id}/message` - Send message (non-streaming)
- `POST /api/conversations/{id}/message/stream` - Send message (streaming)

## Technical Report

### Key Design Decisions

#### 1. Three-Stage Architecture
The system implements a sophisticated three-stage deliberation process:
- **Stage 1**: Individual model responses collected in parallel
- **Stage 2**: Anonymous peer evaluation and ranking
- **Stage 3**: Synthesis by a chairman model

This architecture mimics real-world committee decision-making, reducing individual model biases and leveraging collective intelligence.

#### 2. Asynchronous Parallel Processing
Using Python's asyncio and aiohttp, the system queries all council models simultaneously. This reduces total response time from O(n) to O(1) for the initial response collection phase.

#### 3. Structured Ranking Protocol
The ranking system enforces a strict format (FINAL RANKING: section) that ensures consistent parsing across different model outputs. This structured approach prevents parsing errors and ensures reliable aggregation.

#### 4. Streaming Support
The API supports Server-Sent Events (SSE) for real-time progress updates. Users can watch each stage complete, enhancing transparency and user experience.

#### 5. Conversation Persistence
All conversations are automatically saved with metadata, including:
- Generated titles based on first message
- Complete stage results
- Aggregate rankings
- Timestamps

### Chosen LLM Models

The council uses three diverse models to maximize perspective variety:

1. **Llama 3 (8B)** - Meta's latest open-source model, selected for its balanced performance and reasoning capabilities
2. **Mistral (7B)** - Chosen for its efficiency and strong performance in code and reasoning tasks
3. **Phi-3 (3.8B)** - Microsoft's compact model, included for its surprising capability despite small size

The chairman role is assigned to Llama 3, leveraging its strong synthesis abilities.

### Improvements Over Original Design

#### 1. Enhanced Error Handling
- Graceful degradation when individual models fail
- Comprehensive error reporting in streaming mode
- Fallback mechanisms at each stage

#### 2. Better Response Parsing
- Robust regex patterns for ranking extraction
- Multiple fallback parsing strategies
- Validation of parsed rankings

#### 3. Performance Optimizations
- True parallel model queries using asyncio
- Configurable timeouts for each model
- Efficient data structures for result aggregation

#### 4. Enhanced Metadata
- Automatic conversation titling
- Aggregate ranking calculations
- Detailed performance metrics per model

#### 5. Improved API Design
- RESTful endpoint structure
- Proper CORS configuration
- Comprehensive Pydantic models for type safety
- Both streaming and non-streaming options

#### 6. Better User Experience
- Real-time progress updates via SSE
- Automatic conversation organization
- Clear separation of stages in responses

### Technical Challenges and Solutions

#### Challenge: Model Consistency
Different models output rankings in various formats.

**Solution**: Enforced output format with explicit instructions and robust parsing with multiple fallback methods.

#### Challenge: Performance Bottlenecks
Sequential model queries were too slow.

**Solution**: Implemented true parallel querying using asyncio, reducing response time by ~66%.

#### Challenge: Error Propagation
Single model failures could break the entire process.

**Solution**: Added per-model error isolation and graceful degradation at each stage.

#### Challenge: Memory Management
Storing complete conversation history with all stages.

**Solution**: Implemented efficient JSON storage with lazy loading of conversation details.

### Future Enhancements

1. **Dynamic Model Selection**: Choose council members based on question type
2. **Weighted Voting**: Assign different weights to models based on past performance
3. **Cross-Validation**: Implement multiple rounds of ranking for controversial topics
4. **External Data Integration**: Allow models to search the web or access databases
5. **Performance Analytics**: Track model performance metrics over time
6. **Model Fine-tuning**: Fine-tune chairman model specifically for synthesis tasks

## Conclusion

The LLM Council system demonstrates the power of collaborative AI decision-making. By leveraging multiple specialized models in a structured deliberation process, it produces more nuanced, accurate, and well-reasoned responses than any single model could achieve alone. The system's modular design and robust error handling make it suitable for production use, while the streaming API provides an engaging user experience that reveals the "thought process" behind AI responses.
