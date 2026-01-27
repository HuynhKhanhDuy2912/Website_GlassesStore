import Category from "../models/Category.js";
import slugify from "slugify";

// ➤ Tạo Category
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ message: "Name là bắt buộc" });

    // Kiểm tra tồn tại theo name
    const exist = await Category.findOne({ name: name.trim() });
    if (exist) return res.status(400).json({ message: "Category đã tồn tại" });

    const slug = slugify(name, { lower: true });

    // Kiểm tra trùng slug
    const existSlug = await Category.findOne({ slug });
    if (existSlug) return res.status(400).json({ message: "Slug đã tồn tại" });

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      image: image || "" // lưu trường image
    });

    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};

// ➤ Lấy danh sách Category
export const listCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort("name");
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// ➤ Lấy 1 Category theo ID
export const getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy category" });

    res.json(category);
  } catch (err) {
    next(err);
  }
};

// ➤ Cập nhật Category
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy category" });

    // Cập nhật name + slug nếu có
    if (name) {
      const exist = await Category.findOne({
        name: name.trim(),
        _id: { $ne: category._id }
      });
      if (exist)
        return res.status(400).json({ message: "Tên category đã tồn tại" });

      category.name = name.trim();
      category.slug = slugify(name, { lower: true });
    }

    // Cập nhật description
    if (description !== undefined) category.description = description;

    // Cập nhật image nếu có
    if (image !== undefined) category.image = image;

    await category.save();
    res.json(category);
  } catch (err) {
    next(err);
  }
};

// ➤ Xóa Category
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy category" });

    await category.deleteOne();
    res.json({ message: "Xóa category thành công" });
  } catch (err) {
    next(err);
  }
};
