const https = require('https')
const fs = require('fs')
const FormData = require('form-data')
const axios = require('axios')

const DEFAULT_GROUP_ID = '00000000-0200-4d6c-a19d-b7736ed47777'

const axiosInstance = axios.create({
    baseURL: 'https://kong.tls.ai/abx/api',
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

async function login(username, password) {
    const response = await axiosInstance.post(`/login`, {username, password})
    return response.data.token
}

async function extractFeaturesFromImage(imagePath, token) {
    const formData = new FormData();
    const file = fs.createReadStream(imagePath)
    formData.append("file", file)
    const formHeaders = formData.getHeaders()
    const response = await axiosInstance.post(`/external-functions/extract-faces-from-image`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            ...formHeaders
        },
    })
    return response.data.items
}

async function createMember(data, token) {
    const response = await axiosInstance.post(`/members`, data, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return response.data
}

async function main() {
    const token = await login('ABXAdmin', 'temPassw0rd123$')
    const obamaRawImage = `${__dirname}\\images\\obama.jpg`
    const imageFeatures = await extractFeaturesFromImage(obamaRawImage, token)
    const faceFeatures = imageFeatures[0]
    const memberData = {
        cards: [{
            id: 11111111111, facilityCode: 11111
        }],
        name: 'Barak Obama',
        phone: '01234567',
        description: 'member description',
        email: 'obama@gmail.com',
        images: [faceFeatures],
        memberGroups: [DEFAULT_GROUP_ID]
    }
    const member = await createMember(memberData, token)
}

main()
