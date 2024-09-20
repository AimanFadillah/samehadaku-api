(function() {
    document.addEventListener("DOMContentLoaded", function() {
      var countdownSelector = "#countdown";
      var eastOptionSelector = "#east_option";
  
      // Fungsi countdown
      function startCountdown() {
        var countdownElement = document.querySelector(countdownSelector);
        if (countdownElement) {
          var countdownValue = parseInt(countdownElement.textContent, 10);
          if (countdownValue === 1) {
            countdownElement.remove();
          } else {
            countdownElement.textContent = countdownValue - 1;
            setTimeout(startCountdown, 1000);
          }
        }
      }
  
      // Klik pada elemen dengan class "process_list"
      document.querySelectorAll(".process_list").forEach(function(element) {
        element.addEventListener("click", function() {
          var postId = element.getAttribute("data-post-id");
          var security = element.getAttribute("data-nonce");
  
          document.querySelectorAll(".fico").forEach(function(ficoElement) {
            ficoElement.classList.remove("fa-heart");
            ficoElement.classList.add("fa-spinner", "loading");
          });
  
          fetch(easthemeajax.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "east_process_favorites",
              post_id: postId,
              nonce: security
            })
          })
          .then(response => response.json())
          .then(data => {
            document.querySelectorAll(".fico").forEach(function(ficoElement) {
              ficoElement.classList.add("fa-heart");
              ficoElement.classList.remove("fa-spinner", "loading");
            });
            element.classList.toggle("in-list");
            document.querySelector(".textfavs").textContent = data.text;
            document.querySelector(".countpep").textContent = data.count;
          });
  
          return false;
        });
      });
  
      // Klik untuk menghapus favorit
      document.querySelectorAll(".remove_favorites").forEach(function(element) {
        element.addEventListener("click", function() {
          var postId = element.getAttribute("data-postid");
          var security = element.getAttribute("data-nonce");
  
          document.querySelector("#post" + postId).remove();
  
          fetch(easthemeajax.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "east_process_favorites",
              post_id: postId,
              nonce: security,
              total: "on"
            })
          })
          .then(response => response.text())
          .then(total => {
            document.querySelector(".totalfavorites_user").textContent = total;
          });
  
          return false;
        });
      });
  
      // Klik untuk menghapus views
      document.querySelectorAll(".user_views_control").forEach(function(element) {
        element.addEventListener("click", function() {
          var postId = element.getAttribute("data-postid");
          var security = element.getAttribute("data-nonce");
  
          document.querySelector("#watch" + postId).remove();
  
          fetch(easthemeajax.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "east_proccess_watch",
              post_id: postId,
              nonce: security,
              total: "on"
            })
          })
          .then(response => response.text())
          .then(total => {
            document.querySelector(".totalviews_user").textContent = total;
          });
  
          return false;
        });
      });
  
      // Klik pada elemen dengan class "process_views"
      document.querySelectorAll(".process_views").forEach(function(element) {
        element.addEventListener("click", function() {
          var postId = element.getAttribute("data-post-id");
          var security = element.getAttribute("data-nonce");
  
          var wvcicoElement = document.querySelector(".wvcico");
          wvcicoElement.classList.remove("fa-clock-o");
          wvcicoElement.classList.add("fa-spinner", "loading");
  
          fetch(easthemeajax.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "east_proccess_watch",
              post_id: postId,
              nonce: security
            })
          })
          .then(response => response.text())
          .then(data => {
            wvcicoElement.classList.add("fa-clock-o");
            wvcicoElement.classList.remove("fa-spinner", "loading");
            element.classList.toggle("in-views");
            document.querySelector(".views-count-" + postId).textContent = data;
          });
  
          return false;
        });
      });
  
      // Klik pada elemen dengan class "east_player_option"
      document.querySelectorAll(".east_player_option").forEach(function(element) {
        element.addEventListener("click", function() {
          var postId = element.getAttribute("data-post");
          var nume = element.getAttribute("data-nume");
          var type = element.getAttribute("data-type");
          var tviw = document.querySelector(".playerload").getAttribute("data-text");
          var scds = easthemeajax.playeradstime;
  
          document.querySelector("#fakeplayer").style.display = 'none';
  
          if (!element.classList.contains("on")) {
            document.querySelectorAll(".east_player_option").forEach(function(el) {
              el.classList.remove("on");
            });
  
            var playerOptionLoader = document.querySelector("#player-option-" + nume + " > span.loader");
            playerOptionLoader.style.display = 'block';
            document.querySelector("#playeroptions").classList.add("onload");
  
            if (scds > 0) {
              element.classList.add("on");
            }
  
            fetch(easthemeajax.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                action: "player_ajax",
                post: postId,
                nume: nume,
                type: type
              })
            })
            .then(response => response.text())
            .then(data => {
              if (scds > 0) startCountdown();
  
              playerOptionLoader.style.display = 'none';
              document.querySelector("#player_embed").innerHTML = '<div class="preplayer"></div>';
  
              setTimeout(function() {
                document.querySelector(".asgdc").style.display = 'none';
                document.querySelector("#player_embed").innerHTML = '<div class="pframe">' + data + '</div>';
                document.querySelector("#playeroptions").classList.remove("onload");
  
                if (scds > 0) {
                  document.querySelector(".playerload").textContent = tviw;
                }
              }, scds * 1000);
            });
          }
  
          return false;
        });
      });
  
      // Autoplay player option 1 jika tersedia
      if (document.querySelector("#player-option-1") && easthemeajax.autoplayer === 1) {
        setTimeout(function() {
          document.querySelector("#player-option-1").click();
        }, Math.floor(Math.random() * (700 - 100 + 1) + 100));
      }
  
      // Repeater untuk elemen east_option
      if (document.querySelector(eastOptionSelector)) {
        // Placeholder untuk fitur repeater, jika ada library yang mendukung fitur ini
      }
    });
  })();
  