import "./helpers.js";

extern dec llm_func(target: unknown, description: string);

extern dec scenario(target: unknown, gherkin: string);
model SearchQuery {
  query: string;
  maxResults?: integer;
  includeImages?: boolean;
  safeSearch?: boolean;
}

model WebPageRequest {
  url: string;
  extractText?: boolean;
  includeSummary?: boolean;
}

model RefineSearchOptions {
  originalQuery: string;
  additionalTerms: string[];
  exclude?: string[];
  dateRange?: DateRangeFilter;
}

model DateRangeFilter {
  startDate?: plainDate;
  endDate?: plainDate;
}

model SearchResult {
  title: string;
  url: string;
  snippet: string;
  lastUpdated?: utcDateTime;
}

interface WebSearchBot {
  @scenario(
  """
  Scenario: Basic web search
  When user says "search for weather in New York"
  Then system should extract:
    - Query: "weather in New York"
    - MaxResults: default (10)
  And perform web search
  Examples:
    | Input                                           | Expected Query                  |
    | "find information about TypeScript"             | "TypeScript"                    |
    | "search for vegan restaurants in Chicago"       | "vegan restaurants in Chicago"  |
  """)
  @scenario(
  """
  Scenario: Search with result count specified
  When user says "search for electric cars and show 5 results"
  Then system should extract:
    - Query: "electric cars"
    - MaxResults: 5
  And perform web search
  """)
  @llm_func("Perform a web search using the user's query")
  search(options: SearchQuery): SearchResult[];

  @scenario(
  """
  Scenario: Retrieve specific webpage
  When user says "show me the page at https://example.com/article"
  Then system should extract:
    - URL: "https://example.com/article"
  And retrieve the webpage content
  Examples:
    | Input                                      | Expected URL                       |
    | "get the page www.wikipedia.org/wiki/AI"   | "www.wikipedia.org/wiki/AI"        |
    | "open https://docs.microsoft.com"          | "https://docs.microsoft.com"       |
  """)
  @scenario(
  """
  Scenario: Retrieve webpage with text extraction
  When user says "get the text from https://example.com/article"
  Then system should extract:
    - URL: "https://example.com/article"
    - ExtractText: true
  And retrieve the webpage with text extraction
  """)
  @llm_func("Retrieve and display content from a specific URL")
  retrieveWebPage(options: WebPageRequest): string;

  @scenario(
  """
  Scenario: Refine existing search
  When user says "refine my search to include recent results" after a search for "AI advancements"
  Then system should extract:
    - OriginalQuery: "AI advancements"
    - DateRange: recent
  And perform refined search
  """)
  @scenario(
  """
  Scenario: Refine with additional terms
  When user says "narrow down results to include machine learning and exclude gaming"
  Then system should extract:
    - AdditionalTerms: ["machine learning"]
    - Exclude: ["gaming"]
  And perform refined search
  Examples:
    | Input                             | Additional Terms | Exclude Terms |
    | "add healthcare to my search"     | ["healthcare"]   | []            |
    | "exclude videos from results"     | []               | ["videos"]    |
  """)
  @llm_func("Refine search results based on additional criteria")
  refineSearch(options: RefineSearchOptions): SearchResult[];
}