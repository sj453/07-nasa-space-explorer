// Wait for the page to load before running the code
document.addEventListener('DOMContentLoaded', () => {
  // NASA API key goes here
  const apiKey = 'iTLzGiHNJU4O6z4BWtc8YafzfDStiCM367D68r8Q';

  // Select the elements from the HTML
  const gallery = document.getElementById('gallery'); // Where images will be shown
  const startInput = document.getElementById('start-date'); // Start date input
  const endInput = document.getElementById('end-date'); // End date input
  const getImagesBtn = document.getElementById('get-images'); // Button to get images

  // Create modal elements
  const modal = document.createElement('div');
  modal.id = 'image-modal';
  modal.style.display = 'none';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.7)';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '1000';
  modal.innerHTML = `
    <div id="modal-content" style="background: white; border-radius: 8px; max-width: 600px; width: 90%; margin: auto; padding: 20px; position: relative; text-align: center;">
      <span id="close-modal" style="position: absolute; top: 10px; right: 20px; font-size: 2rem; cursor: pointer;">&times;</span>
      <img id="modal-image" src="" alt="" style="width: 100%; max-height: 350px; object-fit: contain; border-radius: 4px;" />
      <h2 id="modal-title"></h2>
      <p id="modal-date" style="font-weight: bold;"></p>
      <p id="modal-explanation" style="margin-top: 15px;"></p>
    </div>
  `;
  document.body.appendChild(modal);

  // Function to open modal with image info
  function openModal(item) {
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalExplanation = document.getElementById('modal-explanation');
    // Remove any previous video iframe or link
    const oldIframe = document.getElementById('modal-video');
    if (oldIframe) oldIframe.remove();

    if (item.media_type === 'image') {
      modalImage.style.display = 'block';
      modalImage.src = item.hdurl || item.url;
      modalImage.alt = item.title;
    } else if (item.media_type === 'video') {
      modalImage.style.display = 'none';
      // If YouTube, embed the video
      let iframe = null;
      if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
        let videoId = '';
        const ytMatch = item.url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        if (ytMatch && ytMatch[1]) {
          videoId = ytMatch[1];
          iframe = document.createElement('iframe');
          iframe.id = 'modal-video';
          iframe.width = '100%';
          iframe.height = '350';
          iframe.src = `https://www.youtube.com/embed/${videoId}`;
          iframe.frameBorder = '0';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          document.getElementById('modal-content').insertBefore(iframe, modalTitle);
        }
      }
      // If not YouTube, show a link
      if (!iframe) {
        const link = document.createElement('a');
        link.id = 'modal-video';
        link.href = item.url;
        link.target = '_blank';
        link.style.display = 'block';
        link.style.margin = '20px auto';
        link.style.fontSize = '1.2rem';
        link.style.color = '#0b3d91';
        link.style.fontWeight = 'bold';
        link.textContent = 'Watch Video';
        document.getElementById('modal-content').insertBefore(link, modalTitle);
      }
    }
    modalTitle.textContent = item.title;
    modalDate.textContent = `Date: ${item.date}`;
    modalExplanation.textContent = item.explanation;
    modal.style.display = 'flex';
  }

  // Close modal when clicking X or outside content
  modal.addEventListener('click', (e) => {
    if (e.target.id === 'image-modal' || e.target.id === 'close-modal') {
      modal.style.display = 'none';
    }
  });

  // Function to fetch images from NASA API for a date range
  function fetchSpaceImages(startDate, endDate) {
    // Show loading message before fetching
    gallery.innerHTML = '<p style="text-align:center;font-size:1.2rem;">🔄 Loading space photos…</p>';

    // Build the API URL with start and end dates
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`;

    // Fetch data from the API
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        // Clear the gallery before showing new images
        gallery.innerHTML = '';

        // Loop through each item in the data array
        data.forEach(item => {
          // Create a div for each gallery item
          const itemDiv = document.createElement('div');
          itemDiv.className = 'gallery-item';

          // Create the title element
          const title = document.createElement('h3');
          title.textContent = item.title;

          // Create the date element
          const date = document.createElement('p');
          date.textContent = `Date: ${item.date}`;

          if (item.media_type === 'image') {
            // Create the image element
            const image = document.createElement('img');
            image.src = item.url;
            image.alt = item.title;
            itemDiv.appendChild(image);
            itemDiv.appendChild(title);
            itemDiv.appendChild(date);
            // Add click event to open modal with full info
            itemDiv.addEventListener('click', () => openModal(item));
          } else if (item.media_type === 'video') {
            // For YouTube videos, show a thumbnail if possible, otherwise show a link
            let videoThumb = null;
            if (item.url.includes('youtube.com') || item.url.includes('youtu.be')) {
              // Try to extract YouTube video ID
              let videoId = '';
              const ytMatch = item.url.match(/(?:youtube\.com\/.*[?&]v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
              if (ytMatch && ytMatch[1]) {
                videoId = ytMatch[1];
                videoThumb = document.createElement('img');
                videoThumb.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                videoThumb.alt = item.title + ' (YouTube Video)';
                videoThumb.style.cursor = 'pointer';
              }
            }
            if (videoThumb) {
              itemDiv.appendChild(videoThumb);
            } else {
              // Fallback: show a video icon and a link
              const videoIcon = document.createElement('div');
              videoIcon.textContent = '🎬';
              videoIcon.style.fontSize = '4rem';
              videoIcon.style.textAlign = 'center';
              itemDiv.appendChild(videoIcon);
              const videoLink = document.createElement('a');
              videoLink.href = item.url;
              videoLink.target = '_blank';
              videoLink.textContent = 'Watch Video';
              videoLink.style.display = 'block';
              videoLink.style.margin = '10px auto';
              videoLink.style.color = '#0b3d91';
              videoLink.style.fontWeight = 'bold';
              itemDiv.appendChild(videoLink);
            }
            itemDiv.appendChild(title);
            itemDiv.appendChild(date);
            // Add click event to open modal with video
            itemDiv.addEventListener('click', () => openModal(item));
          }
          // Add the gallery item to the gallery
          gallery.appendChild(itemDiv);
        });

        // If no images found, show a message
        if (gallery.innerHTML === '') {
          gallery.innerHTML = '<p>No images found for this date range.</p>';
        }
      })
      .catch(error => {
        // Show an error message if something goes wrong
        gallery.innerHTML = `<p>Error fetching images: ${error.message}</p>`;
      });
  }

  // When the user clicks the button, get the selected dates and fetch images
  getImagesBtn.addEventListener('click', () => {
    // Get the values from the date inputs
    const startDate = startInput.value;
    const endDate = endInput.value;

    // Only fetch if both dates are selected
    if (startDate && endDate) {
      fetchSpaceImages(startDate, endDate);
    } else {
      gallery.innerHTML = '<p>Please select both start and end dates.</p>';
    }
  });

  // Array of fun space facts
  const spaceFacts = [
    "Did you know? A day on Venus is longer than a year on Venus!",
    "Did you know? Neutron stars can spin at a rate of 600 rotations per second!",
    "Did you know? There are more trees on Earth than stars in the Milky Way galaxy.",
    "Did you know? The footprints on the Moon will be there for millions of years.",
    "Did you know? Jupiter is so big that over 1,300 Earths could fit inside it!",
    "Did you know? Space is completely silent—there's no air to carry sound.",
    "Did you know? The hottest planet in our solar system is Venus, not Mercury.",
    "Did you know? One million Earths could fit inside the Sun!",
    "Did you know? The International Space Station travels at 28,000 km/h (17,500 mph).",
    "Did you know? Saturn's rings are made mostly of ice and rock particles."
  ];

  // Pick a random fact
  const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

  // Create and display the fact section above the gallery
  const factSection = document.createElement('div');
  factSection.id = 'space-fact';
  factSection.textContent = randomFact;
  factSection.style.background = '#0b3d91';
  factSection.style.color = '#fff';
  factSection.style.padding = '16px';
  factSection.style.borderRadius = '8px';
  factSection.style.margin = '0 auto 24px auto';
  factSection.style.maxWidth = '700px';
  factSection.style.fontSize = '1.15rem';
  factSection.style.textAlign = 'center';
  factSection.style.letterSpacing = '0.5px';
  factSection.style.boxShadow = '0 2px 8px #0b3d9120';

  // Insert the fact section before the gallery
  gallery.parentNode.insertBefore(factSection, gallery);
});