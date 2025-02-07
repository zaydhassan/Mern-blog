import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Button, InputLabel, TextField, Typography, Select, MenuItem, styled, useTheme } from "@mui/material";
import toast from "react-hot-toast";
import 'quill/dist/quill.snow.css';
import Quill from 'quill';

const StyledFormBox = styled(Box)(({ theme }) => ({
  width: "55%",
  border: "none",
  borderRadius: "20px",
  padding: theme.spacing(3),
  margin: `${theme.spacing(-3)} auto`,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'dark'
    ? `12px 12px 24px #bebebe, -12px -12px 24px #ffffff`
    : `12px 12px 24px #d9d9d9, -12px -12px 24px #ffffff`,
  transition: "all 0.3s ease-in-out"
}));

const categories = ['Technology', 'Education', 'Health', 'Entertainment', 'Food', 'Business', 'Social Media', 'Travel', 'News'];

const CreateBlog = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const id = localStorage.getItem("userId");
  const [inputs, setInputs] = useState({ title: "", description: "", image: "", category: ""});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [useImageUrl, setUseImageUrl] = useState(true);
  const quillRef = useRef(null);
  const [quill, setQuill] = useState(null);

  useEffect(() => {
    const editorContainer = quillRef.current;  

    if (editorContainer && !quill) {
      const newQuill = new Quill(editorContainer, {
        theme: 'snow',
        placeholder: 'Write something amazing...',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['clean'],
          ],
        },
      });

      newQuill.on('text-change', () => {
        setInputs((prev) => ({
          ...prev,
          description: newQuill.root.innerHTML,
        }));
      });

      setQuill(newQuill);
    }

    return () => {
      if (quill) {
        quill.off('text-change');  
        if (editorContainer) editorContainer.innerHTML = "";  
        setQuill(null);  
      }
    };
  }, [quill]);     

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setUploadedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBlogAction = async (status) => {
    const payload = {
      title: inputs.title,
      description: inputs.description,
      image: useImageUrl ? inputs.image : uploadedImage,
      category: inputs.category,
      user: id,
      status
    };

    if (!inputs.title || !inputs.description || !inputs.category || (!inputs.image && !uploadedImage)) {
      toast.error("Please provide all fields");
      return;
    }

    try {
      const response = await axios.post("/api/v1/blog/create-blog", payload);
      if (response.data.success) {
        toast.success(`Blog ${status === 'Published' ? 'published' : 'saved as draft'}`, { icon: '👏' });
        navigate("/my-blogs");
      } else {
        throw new Error(`Failed to ${status.toLowerCase()} blog.`);
      }
    } catch (error) {
      console.error("Failed to create blog:", error);
      toast.error(`Failed to ${status.toLowerCase()} blog: ` + (error.response ? error.response.data.message : "Check the console for more information."));
    }
  };

  return (
    <form style={{
      backgroundImage: "url('./create.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ alignSelf: 'flex-end', padding: theme.spacing(2) }}>
        <Button onClick={() => handleBlogAction('Published')} variant="contained" style={{ marginRight: 15 }}>
          Publish
        </Button>
        <Button onClick={() => handleBlogAction('Draft')} variant="outlined">
          Save Draft
        </Button>
      </div>
      <StyledFormBox>
        <Typography variant="h5" textAlign="center" fontWeight="bold" paddingBottom={0} paddingTop={0} color={theme.palette.text.primary}>
          Create A Blog
        </Typography>
        <InputLabel>Title</InputLabel>
        <TextField name="title" value={inputs.title} onChange={handleChange} variant="outlined" required size="small" />
        <InputLabel>Description</InputLabel>
        <div ref={quillRef} style={{ height: 200, backgroundColor: theme.palette.background.paper }} />
        <InputLabel>Category</InputLabel>
        <Select
          name="category"
          value={inputs.category}
          onChange={handleChange}
          fullWidth
          required
        >
          {categories.map((category, index) => (
            <MenuItem key={index} value={category}>{category}</MenuItem>
          ))}
        </Select>
        <InputLabel>Choose Image Source</InputLabel>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <Button variant="contained" onClick={() => setUseImageUrl(true)}>Use Image URL</Button>
          <Button variant="contained" onClick={() => setUseImageUrl(false)}>Upload Image</Button>
        </div>
        {useImageUrl ? (
          <TextField name="image" value={inputs.image} onChange={handleChange} variant="outlined" fullWidth size="small" />
        ) : (
          <input type="file" accept="image/*" onChange={handleFileChange} />
        )}
      </StyledFormBox>
    </form>
  );
};

export default CreateBlog;
