const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Sample data - In a real application, this would come from a database
const customers = [];
const transactions = [];
const segments = ['All Segments', 'Gold Tier', 'Platinum Tier', 'Silver Tier', 'Affluent', 'Standard Tier'];
const cobrandCards = ['Card X', 'Card Y', 'Card Z', 'Card A', 'Card B', 'Card C'];
const spendingCategories = ['Dining', 'Travel', 'Shopping', 'Electronics', 'Groceries', 'Entertainment'];

/**
 * Find candidates based on specified criteria
 * 
 * @param {Object} criteria - Search criteria
 * @param {string} criteria.category - Spending category (e.g., 'Dining', 'Travel')
 * @param {string} criteria.timePeriod - Time period for transactions (e.g., 'Last 3 Months', 'Last 6 Months', 'Last 12 Months')
 * @param {number} criteria.minSpending - Minimum spending amount
 * @param {Array<string>} criteria.segments - Selected customer segments
 * @param {Array<string>} criteria.exclusions - Co-brand cards to exclude
 * @returns {Array<Object>} - List of matching candidates
 */
function findCandidates(criteria) {
  // TODO: Implement the logic to find candidates based on the criteria
  return [];
}

/**
 * Calculate total spending for a customer in a specific category within a time period
 * 
 * @param {string} customerId - Customer ID
 * @param {string} category - Spending category
 * @param {string} timePeriod - Time period (e.g., 'Last 3 Months')
 * @returns {number} - Total spending amount
 */
function calculateTotalSpending(customerId, category, timePeriod) {
  // TODO: Implement the logic to calculate total spending
  return 0;
}

/**
 * Check if a customer holds any of the excluded co-brand cards
 * 
 * @param {string} customerId - Customer ID
 * @param {Array<string>} exclusions - List of co-brand cards to exclude
 * @returns {boolean} - True if customer holds any excluded card, false otherwise
 */
function hasExcludedCards(customerId, exclusions) {
  // TODO: Implement the logic to check for excluded cards
  return false;
}

/**
 * Check if a customer belongs to any of the selected segments
 * 
 * @param {string} customerId - Customer ID
 * @param {Array<string>} selectedSegments - List of selected segments
 * @returns {boolean} - True if customer belongs to any selected segment, false otherwise
 */
function isInSelectedSegments(customerId, selectedSegments) {
  // TODO: Implement the logic to check if customer is in selected segments
  return false;
}

/**
 * Get transactions for a customer within a specific time period
 * 
 * @param {string} customerId - Customer ID
 * @param {string} timePeriod - Time period (e.g., 'Last 3 Months')
 * @returns {Array<Object>} - List of transactions
 */
function getTransactionsInPeriod(customerId, timePeriod) {
  // TODO: Implement the logic to get transactions in the specified period
  return [];
}

/**
 * Save a search criteria set with a name
 * 
 * @param {string} name - Name for the saved search
 * @param {Object} criteria - Search criteria to save
 * @returns {Object} - Saved search object with ID
 */
function saveSearch(name, criteria) {
  // TODO: Implement the logic to save a search
  return { id: 'search-id', name, criteria };
}

/**
 * Load a saved search by ID
 * 
 * @param {string} searchId - ID of the saved search
 * @returns {Object} - Saved search object with criteria
 */
function loadSearch(searchId) {
  // TODO: Implement the logic to load a saved search
  return { id: searchId, name: 'Saved Search', criteria: {} };
}

/**
 * Delete a saved search by ID
 * 
 * @param {string} searchId - ID of the saved search to delete
 * @returns {boolean} - True if successful, false otherwise
 */
function deleteSearch(searchId) {
  // TODO: Implement the logic to delete a saved search
  return true;
}

// API Routes

// Get available spending categories
app.get('/api/categories', (req, res) => {
  res.json({ categories: spendingCategories });
});

// Get available customer segments
app.get('/api/segments', (req, res) => {
  res.json({ segments });
});

// Get available co-brand cards for exclusion
app.get('/api/cobrand-cards', (req, res) => {
  res.json({ cobrandCards });
});

// Find candidates based on criteria
app.post('/api/find-candidates', (req, res) => {
  try {
    const criteria = req.body;
    
    // Validate input
    if (criteria.minSpending < 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Minimum spending must be a non-negative number.',
        details: { field: 'minSpending', error: 'must be non-negative' }
      });
    }
    
    // Find matching candidates
    const candidates = findCandidates(criteria);
    
    // Return results
    res.json({
      status: 'success',
      data: candidates,
      count: candidates.length,
      message: candidates.length > 0 ? 'Candidates found.' : 'No customers found matching your criteria.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while processing your request.',
      details: { error: error.message }
    });
  }
});

// Save a search
app.post('/api/save-search', (req, res) => {
  try {
    const { name, criteria } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Search name cannot be empty.'
      });
    }
    
    const savedSearch = saveSearch(name, criteria);
    
    res.json({
      status: 'success',
      data: savedSearch,
      message: 'Search saved successfully.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while saving the search.',
      details: { error: error.message }
    });
  }
});

// Get saved searches
app.get('/api/saved-searches', (req, res) => {
  // TODO: Implement the logic to get saved searches
  res.json({
    status: 'success',
    data: []
  });
});

// Load a saved search
app.get('/api/saved-searches/:id', (req, res) => {
  try {
    const searchId = req.params.id;
    const savedSearch = loadSearch(searchId);
    
    if (!savedSearch) {
      return res.status(404).json({
        status: 'error',
        message: 'Saved search not found.'
      });
    }
    
    res.json({
      status: 'success',
      data: savedSearch
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while loading the search.',
      details: { error: error.message }
    });
  }
});

// Delete a saved search
app.delete('/api/saved-searches/:id', (req, res) => {
  try {
    const searchId = req.params.id;
    const success = deleteSearch(searchId);
    
    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: 'Saved search not found or could not be deleted.'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Search deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while deleting the search.',
      details: { error: error.message }
    });
  }
});

// Export results to CSV/Excel
app.post('/api/export', (req, res) => {
  try {
    const { format, candidates } = req.body;
    
    if (!candidates || candidates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No data to export.'
      });
    }
    
    // TODO: Implement the logic to generate CSV/Excel file
    
    res.json({
      status: 'success',
      message: `Export to ${format} completed successfully.`,
      downloadUrl: `/exports/candidates.${format.toLowerCase()}`
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while exporting the data.',
      details: { error: error.message }
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Target Audience Finder API running on port ${PORT}`);
});

module.exports = {
  findCandidates,
  calculateTotalSpending,
  hasExcludedCards,
  isInSelectedSegments,
  getTransactionsInPeriod,
  saveSearch,
  loadSearch,
  deleteSearch
};