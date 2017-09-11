var localData

$(".main").on("click",function(){
    $("button").attr("disabled", true)
    $.ajax({
        url: "/scrape",
        method: "GET"
      }).done(function(response) {
          console.log(response)
          $(".show-articles").html("")         

        for (var i=0; i < response.length;i++){
          
        var div = $('<div class="container boxer"></div>')
        $(div).append('<h2 class="article-title" id="t' + i.toString()+ '">'+response[i].title+'</h2>  <div class="panel panel-default"><div class="panel-body article-link" id="l' + i.toString()+ '"><a href="'+response[i].link+'" target="_blank">'+response[i].link +'</a></div></div><button class="btn btn-primary add-to-saved" title="' + response[i].title + '" link="' + response[i].link +  '">Add to saved articles</button>')

        
        
        $(".show-articles").append(div)


        }

        $(".boxer").css({
            'border' : '1px solid black',
            'border-radius' : '20px',
            "margin": "15px auto"
         });

        $(".add-to-saved").css({
            'position' : 'relative',
            'bottom' : '12px'
    
         });

        $(".article-link").css({
            'font-size' : '0.6em',
            "word-wrap": "break-word"
         });   
         
         $(".show-articles").css({
            'background-color' : '#FFA500',
         });            

        $("#scrape-modal-message").html("Successfully scraped the latest " + response.length.toString() + " post(s)!")
        $('#scraped-articles').modal('toggle');
        $("button").attr("disabled", false)
      })
})

$(".secondary").on("click",function(){
    $("button").attr("disabled", true)
    $.ajax({
        url: "/showarticles",
        method: "GET"
      }).done(function(response) {
        localData = response
        console.log(response)
        $(".show-articles").html("")         
        
                for (var i=0; i < response.length;i++){
                  
                var div = $('<div class="container boxer"></div>')
                $(div).append('<h2 class="article-title" id="t' + i.toString()+ '">'+response[i].title+'</h2>  <div class="panel panel-default"><div class="panel-body article-link" id="l' + i.toString()+ '"><a href="'+response[i].link+'" target="_blank">'+response[i].link +'</a></div></div><button class="btn btn-primary add-note-button spair" bid="' + response[i]._id + '">Add Note</button><button class="btn btn-danger delete-button spair" bid="' + response[i]._id + '">Delete Article</button>')
        
                
                
                $(".show-articles").append(div)
        
        
                }
        
                $(".boxer").css({
                    'border' : '1px solid black',
                    'border-radius' : '20px',
                    "margin": "15px auto"
                 });
        
                $(".add-to-saved").css({
                    'position' : 'relative',
                    'bottom' : '12px'
            
                 });
        
                $(".article-link").css({
                    'font-size' : '0.6em',
                    "word-wrap": "break-word"
                 });   

                $(".show-articles").css({
                    'background-color' : '#33d6ff',
                 });      
                 
                 $(".spair").css({
                    'margin-bottom' : '10px',
                    "position" : "relative",
                    "bottom" : "10px"
                 });   

                 $(".delete-button").css({
                    'margin-left' : '10px',
                 });                    

                 if (response.length === 0){
                    $(".show-articles").html("There are no saved articles!")                 
                 }

                $("button").attr("disabled", false)
      })
})

$('body').on('click', '.add-to-saved', function() {
    $("button").attr("disabled", true)
    var btitle = $(this).attr("title")
    var blink = $(this).attr("link")
    var buttonToDelete = this
    $.ajax({
        url: "/savearticle",
        method: "POST",
        data: {title: btitle, link:blink}
      }).done(function(response) {
          console.log(this)
        $("button").attr("disabled", false)




        $(buttonToDelete.closest('.boxer')).fadeOut(1000, function() {
            $(buttonToDelete).closest('.boxer').remove();
        });

        swal(
            'Success!',
            'Article saved to database!',
            'success'
          )
      })
})

$('body').on('click', '.delete-button', function() {
    var buttonToDelete = this   
    swal({
        title: 'Are you sure you want to delete this article?',
        text: "You can't undo this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(function () {
        $.ajax({
            url: "/deletearticle",
            method: "DELETE",
            data: {id:$( buttonToDelete).attr("bid")}
          }).done(function(response) {
            $(buttonToDelete.closest('.boxer')).fadeOut(1000).promise().done(function() {
                $(buttonToDelete).closest('.boxer').remove();
                if ($('.boxer').length === 0){
                    $(".show-articles").html("There are no saved articles!")   
                }
            });
        
        swal(
          'Deleted!',
          'Your article has been deleted.',
          'success'
        )


        console.log($('.boxer').length)
        if ($('.boxer').length <= 1){
            $(".show-articles").html("There are no saved articles!")   
        }

      })
    })
})



$('body').on('click', '.add-note-button', function() {
    var id = $(this).attr("bid")
    $('#article-notes').modal('toggle');
    $('.comment-submit').attr("bid",id)
    $('.comment-box').html("")

    for (var i=0;i < localData.length; i++){
        if (localData[i]._id === id){
        populateNotes(localData[i], id, "", "", false)  
        break
        }
    }

 
})

$('body').on('click', '.comment-submit', function() {
    event.preventDefault(event)
    var name = $(".name").val()
    var comment = $(".note").val()
    $(".name").val("")
    $(".note").val("")
    var bid = $(this).attr("bid")
    console.log(bid)
    $.ajax({
        url: "/addnote",
        method: "POST",
        data: {
            id: bid,
            name: name,
            comment: comment
        }
      }).done(function(response) {
            populateNotes(response, bid, name, comment, true)
      })
})



$('body').on('click', '.delete-comment', function() {
    var buttonToDelete = this
    var name = $(this).attr("name")
    var comment = $(this).attr("comment")
    var bid = $(this).attr("bid")
    console.log(name)
    console.log(comment)
    $.ajax({
        url: "/deletenote",
        method: "DELETE",
        data: {
            name: name,
            comment: comment,
            id: bid
        }
      }).done(function(response) {
        $(buttonToDelete.closest('.comment-container')).fadeOut(500).promise().done(function() {
            $(buttonToDelete).closest('.comment-container').remove();
        });    
        
        for (var i=0;i < localData.length; i++){
            if (localData[i]._id === bid){
                for (var j=0;j<localData[i].notes.length;j++){
                    if (localData[i].notes[j].name === name && localData[i].notes[j].comment === comment){
                        localData[i].notes.splice(j,1);
                        break
                    }
                    break
                }
            }
        }        

      })   
})




function populateNotes(response, bid, name, comment, bool){
    $(".comment-box").html("")
    console.log(response)
    var postResult = response.notes
    console.log(postResult)
    if (bool === true){
        postResult.push({ name: name, comment: comment })
    }
    console.log(postResult)
    for (var i=0; i < postResult.length; i++){
            var nameComment = postResult[i].name + " says: " +  postResult[i].comment
            var commentContainer = $('<div class="comment-container"></div>')


            var rcomment = $('<div style="display: inline-block"><span class="name-span">'+postResult[i].name+'   </span><span class="says">says</span>:<span class="comment-span">   "'+postResult[i].comment+'"</span></div>')   
            var ex = $('<button class="delete-comment btn btn-danger" bid="'+bid+'" style="display: inline-block" name="'+postResult[i].name+'" comment="'+postResult[i].comment+'">X</button>')   
            
            
            $(commentContainer).append(ex)
            $(commentContainer).append(rcomment)

            $(".comment-box").append(commentContainer)

            $(".name-span").css({
                "font-weight": "bold"
            })   

            $(ex).css({
                "margin-right": "10px",
            })   

            $(".says").css({
                "font-style": "italic",
                "text-decoration": "underline"
            })   
    }
}