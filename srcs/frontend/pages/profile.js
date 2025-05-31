import { useApi } from "../src/api/Api.js";
import router from "../src/routing/Router.js";
import { Button, Div, Input, Text } from "../util/elements.js";

export async function profilePage() {
  const api = useApi();
  
  try {
    const { user_data } = await api.getProfile();
    const { username, email, isActiveTwoFactor, profile_picture } = user_data;

    // Fetch user bio separately
    let userBio = "";
    try {
      const bioResponse = await api.getUserBio();
      userBio = bioResponse.bio || "";
    } catch (error) {
      console.error("Failed to fetch user bio:", error);
    }

    // Main container with Bootstrap classes
    const profilePage = Div( { className: "profile-page container my-5" } );

    // -- Page Headings
    profilePage.appendChild(
      Text( {
        tag: "h1",
        content: "Welcome to Profile-Page",
        attributes: { class: "text-center mb-3" },
      } )
    );

    // -- Profile Info Row
    const profileInfo = Div( { className: "row mb-4" } );

    // LEFT COL: Profile Picture
    const picCol = Div( { className: "col-md-4 d-flex flex-column align-items-center mb-3" } );
    const profilePic = Text( {
      tag: "img",
      attributes: {
        id: "profile-pic",
        src: profile_picture || "https://fastly.picsum.photos/id/844/1024/1024.jpg?hmac=nSyoIOvhBYKY_KB4fNlJ-yyhiTWE0EdHjJmK7v8-yKk",
        alt: "Profile Picture",
        class: "img-fluid rounded-circle mb-3",
        style: "width: 200px; height: 200px; object-fit: cover;",
      },
    } );
    picCol.appendChild( profilePic );

    // Upload section
    const uploadSection = Div( { className: "upload-section w-100" } );
    const uploadGroup = Div( { className: "input-group mb-3" } );
    const uploadInput = Input( {
      type: "file",
      id: "upload-pic-input",
      className: "form-control",
    } );
    const confirmUploadButton = Button( {
      id: "confirm-upload",
      content: "Upload Picture",
      className: "btn btn-outline-secondary",
    } );

    confirmUploadButton.addEventListener('click', async () => {
      const fileInput = document.getElementById('upload-pic-input');
      if (fileInput.files.length > 0) {
        try {
          const response = await api.uploadProfilePicture(fileInput.files[0]);
          alert('Profile picture uploaded successfully');
          // Optionally refresh the page or update the image src
          profilePic.setAttribute('src', response.profile_picture);
        } catch (error) {
          console.error('Upload failed:', error);
          alert('Failed to upload profile picture');
        }
      }
    });

    uploadGroup.appendChild( uploadInput );
    uploadGroup.appendChild( confirmUploadButton );
    uploadSection.appendChild( uploadGroup );
    picCol.appendChild( uploadSection );

    // RIGHT COL: User Info
    const infoCol = Div( { className: "col-md-8" } );

    // Username and Email
    infoCol.appendChild(
      Text( {
        tag: "p",
        content: `<strong>Username:</strong> <span id="username">${username}</span>`,
        attributes: { class: "mb-2" },
      } )
    );
    infoCol.appendChild(
      Text( {
        tag: "p",
        content: `<strong>Email:</strong> <span id="email">${email}</span>`,
        attributes: { class: "mb-4" },
      } )
    );

    // Bio Section
    const bioSection = Div( { className: "bio-section mb-4" } );
    bioSection.appendChild(
      Text( { tag: "h3", content: "About Me", attributes: { class: "mb-2" } } )
    );
    const bioTextarea = Text( {
      tag: "textarea",
      attributes: {
        id: "bio-text",
        class: "form-control mb-2",
        placeholder: "Write a short description about yourself...",
        rows: "3",
      },
      content: userBio
    } );
    bioSection.appendChild( bioTextarea );
    const saveBioButton = Button( {
      id: "save-bio",
      content: "Save Bio",
      className: "btn btn-primary",
    } );

    saveBioButton.addEventListener('click', async () => {
      const bioText = document.getElementById('bio-text').value;
      try {
        await api.updateUserBio(bioText);
        alert('Bio updated successfully');
      } catch (error) {
        console.error('Failed to update bio:', error);
        alert('Failed to update bio');
      }
    });

    bioSection.appendChild( saveBioButton );
    infoCol.appendChild( bioSection );

    // Two-Factor Authentication
    const twoFactorContainer = Div( { className: "row mb-4" } );
    const twoFactorCol = Div( { className: "col d-flex align-items-center gap-3" } );

    const twoFactorCheckbox = Input( {
      id: "twoFactor",
      type: "checkbox",
      className: "form-check-input",
      checked: isActiveTwoFactor
    } );

    twoFactorCheckbox.addEventListener('change', async () => {
      try {
        await api.set2FA(twoFactorCheckbox.checked);
        alert(`Two-factor authentication ${twoFactorCheckbox.checked ? 'enabled' : 'disabled'}`);
      } catch (error) {
        console.error('Failed to update 2FA:', error);
        twoFactorCheckbox.checked = !twoFactorCheckbox.checked;
        alert('Failed to update two-factor authentication');
      }
    });

    const twoFactorLabel = Text( {
      tag: "label",
      content: "Two-Factor Authentication",
      attributes: { for: "twoFactor", class: "form-check-label" },
    } );

    const showQrButton = Button( {
      id: "show-qr",
      content: "Show QR",
      className: "btn btn-secondary",
    } );

    const qrModal = Div( { className: "modal fade", id: "qr-modal", tabindex: "-1" } );
    const qrModalDialog = Div( { className: "modal-dialog modal-dialog-centered" } );
    const qrModalContent = Div( { className: "modal-content p-3" } );


    showQrButton.addEventListener('click', async () => {
      try {
        const qrResponse = await api.get2FAQR();
        const qrImage = Text( {
          tag: "img",
          attributes: {
            src: qrResponse.qr_code_url,
            alt: "QR Code",
            class: "img-fluid",
          },
        } );
        qrModalContent.innerHTML = '';
        qrModalContent.appendChild( qrImage );
        qrModalDialog.appendChild( qrModalContent );
        qrModal.appendChild( qrModalDialog );
        document.body.appendChild( qrModal );

        const modal = new bootstrap.Modal(qrModal);
        modal.show();

        qrModal.addEventListener('hidden.bs.modal', () => {
          qrModal.remove();
        });
      } catch (error) {
        console.error('Failed to get QR:', error);
        alert('Failed to retrieve QR code');
      }
    });

    twoFactorCol.appendChild( twoFactorCheckbox );
    twoFactorCol.appendChild( twoFactorLabel );
    twoFactorCol.appendChild( showQrButton );
    twoFactorContainer.appendChild( twoFactorCol );

    // Action Buttons
    const actionsRow = Div( { className: "row mb-4" } );
    const actionsCol = Div( { className: "col d-flex gap-3" } );

    const logoutButton = Button( {
      id: "logout-button",
      content: "Logout",
      className: "btn btn-outline-danger",
    } );

    logoutButton.addEventListener('click', async () => {
      try {
        await api.logout();
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        
        router.navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed');
      }
    });

    actionsCol.appendChild( logoutButton );
    actionsRow.appendChild( actionsCol );
    profilePage.appendChild( actionsRow );

    // Assemble final layout
    profileInfo.appendChild( picCol );
    profileInfo.appendChild( infoCol );
    profilePage.appendChild( profileInfo );
    profilePage.appendChild( twoFactorContainer );

    return profilePage;

  } catch (error) {
    console.error('Failed to load profile:', error);
    // Create an error page or redirect
    const errorPage = Div( { className: "container text-center mt-5" } );
    errorPage.appendChild(
      Text( {
        tag: "h1",
        content: "Failed to Load Profile",
        attributes: { class: "text-danger" },
      } )
    );
    return errorPage;
  }
}