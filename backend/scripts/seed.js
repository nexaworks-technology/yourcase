/*
  Seed script: inserts sample users, a firm, matters, documents, and queries for testing.
  Usage: node scripts/seed.js
*/
const mongoose = require('mongoose')
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const { connectDB } = require('../config/database')
const User = require('../models/User')
const Firm = require('../models/Firm')
const ClientMatter = require('../models/ClientMatter')
const Document = require('../models/Document')
const ChatSession = require('../models/ChatSession')
const Query = require('../models/Query')

async function run() {
  await connectDB()
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    await Promise.all([User.deleteMany({}), Firm.deleteMany({}), ClientMatter.deleteMany({}), Document.deleteMany({}), ChatSession.deleteMany({}), Query.deleteMany({})])

    const firm = await Firm.create({
      name: 'YourCase Test Firm',
      contactEmail: 'admin@yourcase.test',
      subscriptionPlan: 'growth',
      subscriptionStatus: 'active',
    })

    // Use create() to trigger pre-save hooks for password hashing
    const users = []
    const seedUsers = [
      { email: 'admin@yourcase.test', password: 'Password123', firstName: 'Admin', lastName: 'User', role: 'admin', firmId: firm._id, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AU' },
      { email: 'lawyer1@yourcase.test', password: 'Password123', firstName: 'Sahil', lastName: 'Kapoor', role: 'lawyer', firmId: firm._id, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SK' },
      { email: 'lawyer2@yourcase.test', password: 'Password123', firstName: 'Avery', lastName: 'Lee', role: 'lawyer', firmId: firm._id, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AL' },
    ]
    for (const u of seedUsers) {
      users.push(await User.create(u))
    }

    const [admin, lawyer1, lawyer2] = users

    const matters = await ClientMatter.insertMany([
      {
        firmId: firm._id,
        matterNumber: 'MAT-0001',
        clientName: 'Acme Corp',
        matterType: 'contracts',
        matterTitle: 'Vendor Agreement Review',
        description: 'Review and negotiate vendor master service agreement.',
        priority: 'high',
        startDate: new Date(),
        assignedLawyers: [lawyer1._id, lawyer2._id],
        courtDetails: { nextHearing: null },
        tags: ['MSA', 'review'],
      },
      {
        firmId: firm._id,
        matterNumber: 'MAT-0002',
        clientName: 'Globex Ltd',
        matterType: 'litigation',
        matterTitle: 'IP Infringement Case',
        description: 'District court filing for trademark infringement.',
        priority: 'urgent',
        startDate: new Date(),
        assignedLawyers: [lawyer2._id],
        courtDetails: { courtName: 'District Court', caseNumber: 'DC-2025-001', nextHearing: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) },
        tags: ['IP', 'trademark'],
      },
    ])

    const [m1, m2] = matters

    const docs = await Document.insertMany([
      {
        firmId: firm._id,
        matterId: m1._id,
        uploadedBy: admin._id,
        fileName: 'msa-draft.pdf',
        originalName: 'MSA Draft.pdf',
        mimeType: 'application/pdf',
        fileType: 'pdf',
        fileSize: 102400,
        fileUrl: 'https://example.com/uploads/msa-draft.pdf',
        documentType: 'contract',
        status: 'uploaded',
        tags: ['msa'],
      },
      {
        firmId: firm._id,
        matterId: m2._id,
        uploadedBy: lawyer1._id,
        fileName: 'complaint.pdf',
        originalName: 'Complaint.pdf',
        mimeType: 'application/pdf',
        fileType: 'pdf',
        fileSize: 204800,
        fileUrl: 'https://example.com/uploads/complaint.pdf',
        documentType: 'petition',
        status: 'uploaded',
        tags: ['filing'],
      },
    ])

    const chat1 = await ChatSession.create({ firmId: firm._id, userId: admin._id, title: 'Contract review', queryType: 'chat', messageCount: 0 })
    await Query.insertMany([
      {
        session: chat1._id,
        firmId: firm._id,
        userId: admin._id,
        matterId: m1._id,
        queryType: 'analysis',
        prompt: 'Summarize the key risks in this MSA.',
        response: { content: 'Summary of key risks...', model: 'gemini-2.5-flash' },
        tags: ['summary'],
      },
    ])

    await session.commitTransaction()
    console.log('Seed completed:')
    console.log({ firm: firm._id.toString(), users: users.length, matters: matters.length, documents: docs.length })
  } catch (err) {
    await session.abortTransaction()
    console.error('Seed failed:', err)
    process.exit(1)
  } finally {
    session.endSession()
    await mongoose.disconnect()
  }
}

run()
