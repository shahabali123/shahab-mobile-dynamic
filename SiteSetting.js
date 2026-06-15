const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    logo: String,
    heroBadge: String,
    heroBrandName: String,
    heroTitle: String,
    heroDescription: String,
    heroImage: String,
    heroWatermark: String,
    heroPrimaryBtnText: String,
    heroPrimaryBtnLink: String,
    heroSecondaryBtnText: String,
    heroSecondaryBtnLink: String,
    heroInstallmentBtnText: String,
    heroInstallmentBtnLink: String,
    instHeroBadge: String,
    instHeroTitle: String,
    instHeroDescription: String,
    instHeroAdvanceText: String,
    instHeroPlanSummary: String,
    siteVisits: { type: Number, default: 0 }
});

module.exports = mongoose.model('SiteSetting', siteSettingSchema);