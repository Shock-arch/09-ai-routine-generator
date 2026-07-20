// Save preferences to local storage when the form is submitted
function savePreferences() {
  const preferences = {
    timeOfDay: document.getElementById('timeOfDay').value,
    focusArea: document.getElementById('focusArea').value,
    timeAvailable: document.getElementById('timeAvailable').value,
    energyLevel: document.getElementById('energyLevel').value,
    selectedActivities: Array.from(
      document.querySelectorAll('input[name="activities"]:checked')
    ).map((checkbox) => checkbox.value)
  };
  localStorage.setItem('userPreferences', JSON.stringify(preferences));
}

function loadPreferences() {
  const savedPreferences = localStorage.getItem('userPreferences');
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences);
    document.getElementById('timeOfDay').value = preferences.timeOfDay || '';
    document.getElementById('focusArea').value = preferences.focusArea || '';
    document.getElementById('timeAvailable').value = preferences.timeAvailable || '';
    document.getElementById('energyLevel').value = preferences.energyLevel || '';
    document.querySelectorAll('input[name="activities"]').forEach((checkbox) => {
      checkbox.checked = preferences.selectedActivities.includes(checkbox.value);
    });
  }
}
// Add an event listener to the form that runs when the form is submitted
document.getElementById('routineForm').addEventListener('submit', async (e) => {
  // Prevent the form from refreshing the page
  e.preventDefault();
  
  // Get values from all form inputs and store them in variables
  const timeOfDay = document.getElementById('timeOfDay').value;
  const focusArea = document.getElementById('focusArea').value;
  const timeAvailable = document.getElementById('timeAvailable').value;
  const energyLevel = document.getElementById('energyLevel').value;
  const selectedActivities = Array.from(
    document.querySelectorAll('input[name="activities"]:checked')
  ).map((checkbox) => checkbox.value);

  const activitiesText = selectedActivities.length > 0
    ? selectedActivities.join(', ')
    : 'none selected';

  const userPrompt = `Create a personalized daily routine for the ${timeOfDay.toLowerCase()} that focuses on ${focusArea.toLowerCase()}. The routine should fit into ${timeAvailable} minutes and match a ${energyLevel.toLowerCase()} energy level. Preferred activities include: ${activitiesText}. Please provide a structured, step-by-step routine with clear actions and a realistic flow that fits these preferences.`;
  
  // Find the submit button and update its appearance to show loading state
  const button = document.querySelector('button[type="submit"]');
  button.textContent = 'Generating...';
  button.disabled = true;
  
  try {    
    // Make the API call to OpenAI's chat completions endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [      
          { role: 'system', content: `You are a helpful assistant that creates quick, focused daily routines. Always keep routines short, realistic, and tailored to the user's preferences.` },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 500
      })
    });
    
    // Convert API response to JSON and get the generated routine
    const data = await response.json();
    const routine = data.choices[0].message.content;
    
    // Show the result section and display the routine
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('routineOutput').textContent = routine;
    
  } catch (error) {
    // If anything goes wrong, log the error and show user-friendly message
    console.error('Error:', error);
    document.getElementById('routineOutput').textContent = 'Sorry, there was an error generating your routine. Please try again.';
  } finally {
    // Always reset the button back to its original state using innerHTML to render the icon
    button.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate My Routine';
    button.disabled = false;
  }
});
