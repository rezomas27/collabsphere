const Post = require('../models/post')
const User = require('../models/user')

const post_index = (req,res) =>{
    Post.find().sort({createdAt:-1})
    .populate('user')
    .then((result)=>{
        res.render('access/posts/posts',{title:'All Posts',posts:result})
    })
    .catch((err)=>{
        console.log(err);
    })
}

const post_details = (req,res)=>{
    const id = req.params.id;
    Post.findById(id)
    .then(result=>{
        res.render('access/posts/details',{post:result,title:'Post Details'});
    })
    .catch(err=>{
        console.log(err);
    });
}

const post_create_get = (req,res)=>{
    res.render('access/posts/create',{title:'Create a Post'});
}

const post_create_post = (req,res)=>{
    console.log(req.body)
    const {title,body,type} = req.body;
    if (!title || !body || !type) {
        return res.status(400).send('Title, body, and type are required');
    }
    const user = req.session.user ? req.session.user._id : null;
    if(!user){
        return res.status(401).send('User not authenticated');
    }
    const newPost = new Post({
        title,
        body,
        type,
        user
    })
    post = Post(newPost);
    post.save()
      .then((result)=>{
        res.redirect('/posts');
      })
      .catch((err)=>{
        console.log(err);
      })
}
const post_delete = (req,res)=>{
    const id = req.params.id
    Post.findByIdAndDelete(id)
        .then(result=>{
            res.json({redirect:'/posts'})
        })
    .catch(err=>{
        console.log(err)
    })
}

module.exports = {
    post_index,
    post_details,
    post_create_get,
    post_create_post,
    post_delete

}