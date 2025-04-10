let buoi = "sang";
document.getElementById("logoutButton")?.addEventListener("click", () => {
    chrome.storage.local.remove("token", () => {
      window.location.href = "popup.html";
    });
});

chrome.storage.local.get(["username"], async (result) => {
    document.getElementById("hoten").innerHTML=result.username;
});


function getInfo () {
  chrome.storage.local.get(["token"], async (result) => {
    if (!result.token) {
      messageElement.textContent = "Bạn chưa đăng nhập!";
      return;
    }
  
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const response = await fetch(`https://internal-api.ript.vn/diem-danh-that/me/${year}/${month}/${day}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${result.token}`,
        },
      });
  
      const data = await response.json();
  
      if (response.ok) {
        const datacheckin = data.data;
        buoi = datacheckin.buoi_lam_viec;
        document.getElementById("checkinsang").innerHTML=(datacheckin.sang.trang_thai_check_in === "Sớm" ? "Đã checkin" : datacheckin.sang.trang_thai_check_in) + " (" + datacheckin.sang.thoi_gian_check_in + ")";
        document.getElementById("checkoutsang").innerHTML=(datacheckin.sang.trang_thai_check_out  === "Sớm" ? "Đã checkout" : datacheckin.sang.trang_thai_check_out)  + " (" + datacheckin.sang.thoi_gian_check_out + ")";
        document.getElementById("checkinchieu").innerHTML=(datacheckin.chieu.trang_thai_check_in === "Sớm" ? "Đã checkin" : datacheckin.chieu.trang_thai_check_in)  + " (" + datacheckin.chieu.thoi_gian_check_in + ")";
        document.getElementById("checkoutchieu").innerHTML=(datacheckin.chieu.trang_thai_check_out  === "Sớm" ? "Đã checkout" : datacheckin.chieu.trang_thai_check_out)  + " (" + datacheckin.chieu.thoi_gian_check_out + ")";
        if((buoi === "sang" && datacheckin.sang.trang_thai_check_in !== "Chưa Check-in") || (buoi === "chieu" && datacheckin.chieu.trang_thai_check_in !== "Chưa Check-in")) 
          document.getElementById("checkinbtn").classList.add('hidden');
        else {
          document.getElementById("checkoutbtn").classList.add('hidden');
        }
        if((buoi === "sang" && datacheckin.sang.trang_thai_check_out !== "Chưa Check-out") || (buoi === "chieu" && datacheckin.chieu.trang_thai_check_out !== "Chưa Check-out")) 
          document.getElementById("checkoutbtn").classList.add('hidden');
      }
    } catch (err) {
      console.log(err);
    }}
  );
}

getInfo();

  
document.getElementById("checkinbtn").addEventListener("click", async () => {
    const messageElement = document.getElementById("attendanceMessage");
  
    // Lấy token từ Chrome storage
    chrome.storage.local.get(["token"], async (result) => {
      if (!result.token) {
        messageElement.textContent = "Bạn chưa đăng nhập!";
        return;
      }

      try {
        const response = await fetch("https://internal-api.ript.vn/diem-danh-that/check-in", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${result.token}`,
          },
          body: JSON.stringify({ buoi: buoi })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          messageElement.style.color = "green";
          messageElement.textContent = "Điểm danh thành công!";
          getInfo();
        } else {
          messageElement.style.color = "red";
          messageElement.textContent = "Điểm danh thất bại: " + (data.message || "Lỗi không xác định");
        }
      } catch (error) {
        messageElement.style.color = "red";
        messageElement.textContent = "Lỗi kết nối!";
      }
    });
});


document.getElementById("checkoutbtn").addEventListener("click", async () => {
  const messageElement = document.getElementById("attendanceMessage");

  // Lấy token từ Chrome storage
  chrome.storage.local.get(["token"], async (result) => {
    if (!result.token) {
      messageElement.textContent = "Bạn chưa đăng nhập!";
      return;
    }

    const confirmLogout = confirm("Bạn chắc chắn đã hoàn thành hết công việc trước khi ra về?");
    if (confirmLogout) {
      try {
        const response = await fetch("https://internal-api.ript.vn/diem-danh-that/check-out", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${result.token}`,
          },
          body: JSON.stringify({ buoi: buoi })
        });
  
        const data = await response.json();
  
        if (response.ok) {
            console.log(data);
          messageElement.style.color = "green";
          messageElement.textContent = "Điểm danh thành công!";
          getInfo();
        } else {
          messageElement.style.color = "red";
          messageElement.textContent = "Điểm danh thất bại: " + (data.message || "Lỗi không xác định");
        }
      } catch (error) {
        messageElement.style.color = "red";
        messageElement.textContent = "Lỗi kết nối!";
      }
    }
  });
});
  