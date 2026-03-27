import XLSX from 'xlsx'

import incomeModel from "../models/incomeModel.js";
import getDateRange from "../utils/dataFilter.js";

// Add income { description, amount, category, date }
export async function addIncome(req, res) {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const newIncome = new incomeModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });
    await newIncome.save();

    res.status(201).json({
      success: true,
      message: "Income added successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// To GET all income
export async function getAllIncome(req, res) {
  const userId = req.user._id;

  try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    res.json(income);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// Update an income { description, amount }
export async function updateIncome(req, res) {
  const { id } = req.params;
  const userId = req.user._id;
  const { description, amount } = req.body;

  try {
    const updateIncome = await incomeModel.findOneAndUpdate(
      {
        _id: id,
        userId,
      },
      { description, amount },
      { new: true },
    );

    if (!updateIncome) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
		}
		
		res.json({success: true, message: "Income updated successfully.", data: updateIncome})
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


// To delete an income
export async function deleteIncome(req, res) {
	try {
    const income = await incomeModel.findByIdAndDelete({ _id: req.params.id });
    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found.",
      });
		}
		
		return res.json({
			success: true,
			message: "Income deleted successfully"
		})
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// To download the data in an excel sheet
export async function downloadIncomeExcel(req, res) {
	const userId = req.user._id
	try {
    const income = await incomeModel.find({ userId }).sort({ date: -1 });
    const plainDate = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: new Date(inc.date).toLocaleDateString(),
    }));

    const workSheet = XLSX.utils.json_to_sheet(plainDate);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "incomeModel");
    XLSX.writeFile(workBook, "income_details.xlsx");
		res.download("income_details.xlsx");
		
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export async function getIncomeOverview(req, res) {
	try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;
    const { start, end } = getDateRange(range);

    const incomes = await incomeModel
      .find({
        userId,
        data: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;
    const recentTransactions = incomes.slice(0, 9);

    res.json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}