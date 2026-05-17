/**
 * Pet Feeder Control System - Main Application Logic
 * Handles all user interactions and Supabase database operations
 */

// Supabase Configuration
const SUPABASE_URL = "https://nkalwrqyuixhirwpmfce.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rYWx3cnF5dWl4aGlyd3BtZmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMDQzMTEsImV4cCI6MjA4MDY4MDMxMX0.nFzn1QIBkJmqO12MubTvj3X6ov6iMQ69tcAQ6_ijMYQ";

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const petSelect = document.getElementById('petSelect');
const petImg = document.getElementById('petImg');
const feedNowBtn = document.getElementById('feedNow');
const timeInput = document.getElementById('timeInput');
const qtyInput = document.getElementById('qtyInput');
const statusBox = document.getElementById('statusBox');
const loading = document.getElementById('loading');
const scheduledMealsContainer = document.getElementById('scheduledMeals');

// Application State
let selectedMealId = null;

// Pet Configuration
const assetsBasePath = 'assets/';

const petImages = {
  'cat': assetsBasePath + 'cat.avif',
  'dog': assetsBasePath + 'dog.webp'
};

const petMaxQuantities = {
  'cat': 75,
  'dog': 200
};

/**
 * Update pet image and max quantity when selection changes
 */
petSelect.addEventListener('change', () => {
  const selectedPet = petSelect.value;
  petImg.src = petImages[selectedPet] || (assetsBasePath + 'cat.avif');
  petImg.alt = selectedPet.charAt(0).toUpperCase() + selectedPet.slice(1);
  
  // Update max quantity based on selected pet
  const maxQty = petMaxQuantities[selectedPet] || 200;
  qtyInput.setAttribute('max', maxQty);
  qtyInput.setAttribute('placeholder', `Quantity (g) - Max: ${maxQty}g`);
  
  // Clear current quantity if it exceeds max
  const currentQty = parseInt(qtyInput.value, 10);
  if (currentQty > maxQty) {
    qtyInput.value = '';
  }
});

/**
 * Show loading indicator
 */
function showLoading() {
  loading.classList.add('show');
  feedNowBtn.disabled = true;
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  loading.classList.remove('show');
  feedNowBtn.disabled = false;
}

/**
 * Set minimum time to current time (prevent past scheduling)
 */
function updateTimeInputMin() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  timeInput.setAttribute('min', `${hours}:${minutes}`);
}

/**
 * Validate user inputs
 * @returns {boolean} True if inputs are valid
 */
function validateInputs() {
  const amount = parseInt(qtyInput.value, 10);
  const selectedPet = petSelect.value;
  const maxQty = petMaxQuantities[selectedPet] || 200;
  
  if (!amount || amount < 1) {
    alert('Please enter a valid amount (at least 1g)');
    return false;
  }
  
  if (amount > maxQty) {
    alert(`${selectedPet.charAt(0).toUpperCase() + selectedPet.slice(1)} maximum is ${maxQty}g per meal`);
    return false;
  }
  
  // Validate time if provided
  const timeValue = timeInput.value;
  if (timeValue) {
    const selectedTime = new Date();
    const [hours, minutes] = timeValue.split(':');
    selectedTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    
    const now = new Date();
    if (selectedTime <= now) {
      alert('Cannot schedule a meal in the past. Please select a future time.');
      return false;
    }
  }
  
  return true;
}

/**
 * Create ISO timestamp from time input string
 * @param {string} timeString - Time in HH:MM format
 * @returns {string|null} ISO timestamp string or null
 */
function createISOTimestamp(timeString) {
  if (!timeString) return null;
  
  const selectedDate = new Date();
  const [hours, minutes] = timeString.split(':');
  selectedDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  
  // If time is in the past (shouldn't happen due to validation, but safety check), schedule for tomorrow
  const now = new Date();
  if (selectedDate <= now) {
    selectedDate.setDate(selectedDate.getDate() + 1);
  }
  
  return selectedDate.toISOString();
}

/**
 * Handle Feed Now button click - Creates immediate or scheduled feeding request
 */
async function handleFeedNow() {
  // Validate inputs
  if (!validateInputs()) {
    return;
  }

  try {
    showLoading();

    const amount = parseInt(qtyInput.value, 10);
    const timeValue = timeInput.value;
    
    // Determine action type based on time input
    const action = timeValue ? 'scheduled' : 'now';
    const scheduleTime = createISOTimestamp(timeValue);

    // Prepare the request data
    const requestData = {
      action: action,
      schedule_time: scheduleTime,
      amount: amount,
      status: 'pending'
    };

    // Insert into FeedingRequests table
    const { data, error } = await supabaseClient
      .from('FeedingRequests')
      .insert([requestData])
      .select();

    if (error) {
      throw error;
    }

    // Show success message
    const message = timeValue 
      ? `Scheduled feeding for ${timeValue} (${amount}g)` 
      : `Feed command sent! (${amount}g)`;
    
    alert(message);
    
    // Clear time input after successful feed now (keep amount)
    if (!timeValue) {
      timeInput.value = '';
    }

    // Refresh status and scheduled meals immediately
    // If user has selected a meal, maintain that selection, otherwise show latest
    await loadStatus(selectedMealId);
    await loadScheduledMeals();

  } catch (error) {
    console.error('Error sending feed request:', error);
    alert('Error: ' + (error.message || 'Failed to send feed request'));
  } finally {
    hideLoading();
  }
}

/**
 * Load and display scheduled meals from database
 */
async function loadScheduledMeals() {
  try {
    // Fetch all pending scheduled meals ordered by schedule_time
    const { data, error } = await supabaseClient
      .from('FeedingRequests')
      .select('*')
      .eq('status', 'pending')
      .eq('action', 'scheduled')
      .not('schedule_time', 'is', null)
      .order('schedule_time', { ascending: true });

    if (error) {
      throw error;
    }

    // Clear container
    scheduledMealsContainer.innerHTML = '';

    if (!data || data.length === 0) {
      scheduledMealsContainer.innerHTML = '<div class="empty-state">No scheduled meals</div>';
      return;
    }

    // Filter out past scheduled meals
    const now = new Date();
    const futureMeals = data.filter(meal => {
      const scheduleTime = new Date(meal.schedule_time);
      return scheduleTime > now;
    });

    if (futureMeals.length === 0) {
      scheduledMealsContainer.innerHTML = '<div class="empty-state">No scheduled meals</div>';
      return;
    }

    // Display each scheduled meal
    futureMeals.forEach(meal => {
      const mealItem = document.createElement('div');
      mealItem.className = 'meal-item';
      if (selectedMealId === meal.id) {
        mealItem.classList.add('selected');
      }
      mealItem.setAttribute('data-id', meal.id);

      const scheduleDate = new Date(meal.schedule_time);
      const timeStr = scheduleDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      const dateStr = scheduleDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      mealItem.innerHTML = `
        <div class="meal-info" style="flex: 1; min-width: 0;">
          <div class="meal-time">${dateStr} at ${timeStr}</div>
          <div class="meal-details">Amount: ${meal.amount}g</div>
        </div>
        <div class="meal-actions" onclick="event.stopPropagation();">
          <button class="btn-delete" onclick="cancelMeal(${meal.id})">Cancel</button>
        </div>
      `;

      // Add click handler to select meal and show its status
      mealItem.addEventListener('click', (e) => {
        // Don't trigger if clicking on cancel button
        if (e.target.classList.contains('btn-delete')) {
          return;
        }
        selectMeal(meal.id);
        displayMealStatus(meal);
      });

      scheduledMealsContainer.appendChild(mealItem);
    });

  } catch (error) {
    console.error('Error loading scheduled meals:', error);
    scheduledMealsContainer.innerHTML = '<div class="empty-state">Error loading scheduled meals</div>';
  }
}

/**
 * Cancel a scheduled meal by updating its status to 'cancelled'
 * This allows ESP32 to check status before feeding and skip cancelled meals
 * @param {number} mealId - ID of the meal to cancel
 */
async function cancelMeal(mealId) {
  if (!confirm('Are you sure you want to cancel this scheduled meal?')) {
    return;
  }

  // Store reference to meal element for restoration if needed
  const mealElement = document.querySelector(`[data-id="${mealId}"]`);
  const originalOpacity = mealElement ? mealElement.style.opacity : '1';
  
  try {
    showLoading();

    // Immediately dim the meal in UI for better UX
    if (mealElement) {
      mealElement.style.opacity = '0.5';
      mealElement.style.pointerEvents = 'none';
    }

    // Update status to 'cancelled' instead of deleting
    // This allows ESP32 to re-check status before feeding
    const { data, error } = await supabaseClient
      .from('FeedingRequests')
      .update({ status: 'cancelled' })
      .eq('id', mealId)
      .eq('status', 'pending')  // Only cancel if still pending (prevent race condition)
      .select();

    // Check for errors
    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(error.message || 'Database error occurred while cancelling the meal');
    }

    // Verify the update was successful
    if (data && data.length > 0) {
      // Success - meal was cancelled
      
      // Clear selection if cancelled meal was selected
      if (selectedMealId === mealId) {
        selectedMealId = null;
      }
      
      // Refresh the lists to remove cancelled meal from display
      await loadScheduledMeals();
      await loadStatus(selectedMealId);
      
      // Show success message
      showMessage('Scheduled meal cancelled successfully', 'success');
    } else {
      // No rows updated - meal may have already been processed or cancelled
      throw new Error('Could not cancel meal. It may have already been fed or cancelled.');
    }

  } catch (error) {
    console.error('Error cancelling meal:', error);
    
    // Restore UI element if it exists
    if (mealElement) {
      mealElement.style.opacity = originalOpacity;
      mealElement.style.pointerEvents = 'auto';
    }
    
    // Show error message
    showMessage('Error: ' + (error.message || 'Failed to cancel meal. Please try again.'), 'error');
    
    // Reload the list to restore UI state
    await loadScheduledMeals();
  } finally {
    hideLoading();
  }
}

/**
 * Display success or error messages to user
 * @param {string} text - Message text
 * @param {string} type - Message type: 'success' or 'error'
 */
function showMessage(text, type) {
  // Remove any existing messages first
  const existingMsg = scheduledMealsContainer.querySelector('.status-message');
  if (existingMsg) {
    existingMsg.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = 'status-message';
  const bgColor = type === 'success' ? '#8ec79f' : '#e74c3c';
  messageDiv.style.cssText = `background: ${bgColor}; color: white; padding: 12px; border-radius: 8px; margin: 10px 0; text-align: center; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);`;
  messageDiv.textContent = text;
  
  scheduledMealsContainer.insertBefore(messageDiv, scheduledMealsContainer.firstChild);
  
  // Remove message after 4 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.transition = 'opacity 0.3s';
      messageDiv.style.opacity = '0';
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 300);
    }
  }, 4000);
}

// Make cancelMeal globally accessible for onclick handlers
window.cancelMeal = cancelMeal;

/**
 * Select a meal and highlight it visually
 * @param {number} mealId - ID of the meal to select
 */
function selectMeal(mealId) {
  selectedMealId = mealId;
  
  // Update visual selection
  const mealItems = scheduledMealsContainer.querySelectorAll('.meal-item');
  mealItems.forEach(item => {
    if (parseInt(item.getAttribute('data-id')) === mealId) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

/**
 * Display status for a specific meal object
 * @param {Object} meal - Meal data object from database
 */
function displayMealStatus(meal) {
  let statusText = '';

  // Format status display based on status field
  switch (meal.status) {
    case 'pending':
      statusText = 'Status: Pending';
      break;
    case 'feeded':
      statusText = 'Status: Feeded';
      break;
    case 'cancelled':
      statusText = 'Status: Cancelled';
      break;
    default:
      statusText = `Status: ${meal.status || 'Unknown'}`;
  }

  // Add additional information
  statusText += `\nAction: ${meal.action}`;
  statusText += `\nAmount: ${meal.amount}g`;

  if (meal.schedule_time) {
    const scheduleDate = new Date(meal.schedule_time);
    const timeStr = scheduleDate.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    statusText += `\nScheduled Time: ${timeStr}`;
  }

  if (meal.created_at) {
    const createdDate = new Date(meal.created_at);
    const dateStr = createdDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    statusText += `\nCreated: ${dateStr}`;
  }

  statusBox.textContent = statusText;
}

/**
 * Load and display status (latest meal or selected meal)
 * @param {number|null} mealId - Optional meal ID to load specific meal status
 */
async function loadStatus(mealId = null) {
  try {
    let data, error;
    
    if (mealId) {
      // Fetch specific meal by ID
      const result = await supabaseClient
        .from('FeedingRequests')
        .select('*')
        .eq('id', mealId)
        .single();
      data = result.data ? [result.data] : null;
      error = result.error;
    } else {
      // Fetch the latest row ordered by id descending
      const result = await supabaseClient
        .from('FeedingRequests')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);
      data = result.data;
      error = result.error;
    }

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      statusBox.textContent = 'Nothing scheduled';
      return;
    }

    const request = data[0];
    displayMealStatus(request);

  } catch (error) {
    console.error('Error loading status:', error);
    statusBox.textContent = 'Error loading status: ' + (error.message || 'Unknown error');
  }
}

// Event Listeners
feedNowBtn.addEventListener('click', handleFeedNow);

// Allow Enter key to trigger feed
qtyInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleFeedNow();
  }
});

timeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleFeedNow();
  }
});

/**
 * Initialize application on page load
 */
(async function init() {
  // Set initial pet image and max quantity
  const selectedPet = petSelect.value;
  petImg.src = petImages[selectedPet] || (assetsBasePath + 'cat.avif');
  const maxQty = petMaxQuantities[selectedPet] || 75;
  qtyInput.setAttribute('max', maxQty);
  qtyInput.setAttribute('placeholder', `Quantity (g) - Max: ${maxQty}g`);
  
  // Set minimum time to current time
  updateTimeInputMin();
  
  // Update min time every minute to prevent past scheduling
  setInterval(updateTimeInputMin, 60000);
  
  // Load initial data
  await loadStatus();
  await loadScheduledMeals();
  
  // Auto-refresh status and scheduled meals every 5 seconds
  setInterval(() => {
    // Use selectedMealId if one is selected, otherwise load latest
    loadStatus(selectedMealId);
    loadScheduledMeals();
  }, 5000);
})();

