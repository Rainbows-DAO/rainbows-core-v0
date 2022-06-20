const { expect } = require("chai");
const { ethers } = require("hardhat");

const moveBlocks = require("../utils/move-blocks")
const moveTime = require("../utils/move-time")

describe("Loop", function () {

  let Unit, unit, Loop, loop, plan, token, governor, treasury, fundraiser
  let w1, w2, w3

  before(async function() {
    [w1, w2, w3] = await ethers.getSigners()
    Unit = await ethers.getContractFactory("UnitToken")
    unit = await Unit.deploy()
    await unit.deployed()
    Loop = await ethers.getContractFactory("Loop")
    loop = await Loop.deploy("Rainbows Live", "A global metaverse event to change the world", unit.address)
    await loop.deployed()
    plan = await ethers.getContractAt("Plan", await loop.plan())
    token = await ethers.getContractAt("GovernanceToken", await loop.token())
    governor = await ethers.getContractAt("GovernorContract", await loop.governor())
    treasury = await ethers.getContractAt("Treasury", await loop.treasury())
    fundraiser = await ethers.getContractAt("CrowdFund", await treasury.fundraiser())
  })

  it("has a title and description", async function () {
    expect(await loop.title()).to.equal("Rainbows Live")
    expect(await loop.description()).to.equal("A global metaverse event to change the world")
  })

  it("is in Planning State", async function() {
    expect(await loop.state()).to.equal(await loop.PLANNING());
  })

  describe("Members", function() {

    it("creator is a member", async function() {
      expect(await loop.isMember(w1.address)).to.be.true
    })

    it("anyone can join", async function() {
      expect(await loop.isMember(w2.address)).to.be.false
      expect(await loop.isMember(w3.address)).to.be.false
      await loop.connect(w2).join();
      await loop.connect(w3).join();
      expect(await loop.isMember(w2.address)).to.be.true
      expect(await loop.isMember(w3.address)).to.be.true
    })

    it("mints a token when joining", async function() {
      expect(await token.balanceOf(w1.address)).to.equal(ethers.BigNumber.from(1))
      expect(await token.balanceOf(w2.address)).to.equal(ethers.BigNumber.from(1))
      expect(await token.balanceOf(w3.address)).to.equal(ethers.BigNumber.from(1))
      expect(await token.totalSupply()).to.equal(ethers.BigNumber.from(3))
    })

    it("anyone can leave", async function() {
      expect(await loop.isMember(w2.address)).to.be.true
      await loop.connect(w2).leave();
      expect(await loop.isMember(w2.address)).to.be.false
    })

    it("burns a token when leaving", async function() {
      expect(await token.balanceOf(w2.address)).to.equal(ethers.BigNumber.from(0))
      expect(await token.totalSupply()).to.equal(ethers.BigNumber.from(2))
    })

  })

  describe("Plan", function() {

    const itemOne = {
      title: "Concert: production plan",
      description: "Build concert specification, timeline and budget",
      budget: 1000
    }

    const itemTwo = {
      title: "Marketing campaign",
      description: "Advertise the concert",
      budget: 4000
    }

    it("starts OPEN", async function() {
      expect(await plan.isOpen()).to.be.true
    })

    describe("when OPEN", function() {

      it("rejects if sender is not a member", async function() {
        const { title, description, budget } = itemOne
        await expect(plan.connect(w2).addItem(title, description, budget))
          .to.be.revertedWith('must be a member')
      })

      it("a member can add items - itemOne", async function() {
        let { title, description, budget } = itemOne
        itemOne.id = await plan.itemHash(title, description, budget)
        await expect(plan.addItem(title, description, budget))
              .to.emit(plan, 'ItemAdded')
              .withArgs(itemOne.id, title, description, budget)
        expect(await plan.totalBudget()).to.equal(1000)
      })

      it("a member can add items - itemTwo", async function() {
        let { title, description, budget } = itemTwo
        itemTwo.id = await plan.itemHash(title, description, budget)
        await expect(plan.connect(w3).addItem(title, description, budget))
              .to.emit(plan, 'ItemAdded')
              .withArgs(itemTwo.id, title, description, budget)
        expect(await plan.totalBudget()).to.equal(5000)
      })

      it("removes an item", async function() {
        await expect(plan.removeItem(itemOne.id))
              .to.emit(plan, 'ItemRemoved')
              .withArgs(itemOne.id)
        expect(await plan.totalBudget()).to.equal(4000)
      })

      it("cant remove twice", async function() {
        await expect(plan.removeItem(itemOne.id))
          .to.revertedWith("item not found");
      })

    })

    describe("checking for items", () => {

      it("finds itemTwo", async function() {
        expect(await plan.hasItem(itemTwo.id)).to.be.true
      })

      it("misses itemOne", async function() {
        expect(await plan.hasItem(itemOne.id)).to.be.false
      })

      it("misses a random item", async function() {
        let notAnItem = await plan.itemHash("a", "b", 10)
        expect(await plan.hasItem(notAnItem)).to.be.false
      })

    })

    describe("Closing the Plan", function() {

      let pending = 0
      let active = 1
      let canceled = 2
      let defeated = 3
      let succeeded = 4
      let queued = 5
      let expired = 6
      let executed = 7
      let proposalId

      it("creates the proposal, which is pending", async function() {
        let delegateTx = await token.delegate(w1.address)
        await delegateTx.wait(1)
        delegateTx = await token.connect(w3).delegate(w3.address)
        await delegateTx.wait(1)
        
        let proposaltx = await loop.proposePlan()
        let receipt = await proposaltx.wait(1)
        proposalId = receipt.events[1].args.proposalId

        expect(await governor.state(proposalId)).to.equal(pending)
        await moveBlocks(2, false)
        expect(await governor.state(proposalId)).to.equal(active)
      })

      it("approves the plan", async function() {
        let voteTx = await governor.castVote(proposalId, 1)
        await voteTx.wait(1)
        voteTx = await governor.connect(w3).castVote(proposalId, 1)
        await voteTx.wait(1)

        await moveBlocks(11, false)
        expect(await governor.state(proposalId)).to.equal(succeeded)
      })

      it("queues the plan", async function() {
        let queueTx = await loop.queueApprovePlan()
        await queueTx.wait(1)
        expect(await governor.state(proposalId)).to.equal(queued)
        await moveTime(11, false)
        await moveBlocks(1, false)
      })

      it("executes the plan", async function() {
        let execTx = await loop.executeApprovePlan()
        await execTx.wait(1)
        expect(await governor.state(proposalId)).to.equal(executed)

        expect(await plan.isOpen()).to.be.false
        expect(await loop.state()).to.equal(await loop.FUNDRAISING());
      })

    }) 

    describe("Treasury", function() {

      describe("Fundraising", function() {

        before(async function() {
          await unit.mint(5000)
          await unit.connect(w2).mint(5000)
        })
  
        it("the goal is equal to totalBudget", async() => {
          let campaign = await fundraiser.campaigns(1)
          expect(campaign.goal).to.equal(ethers.BigNumber.from(4000))
        })
  
        it("accepts pledges", async function() {
          await unit.approve(fundraiser.address, 1500)
          await unit.connect(w2).approve(fundraiser.address, 2500)
          await fundraiser.pledge(1, 1500)
          await fundraiser.connect(w2).pledge(1, 2500)
        })
  
        it("claims the units", async function() {
          await moveBlocks(110, false)
          await loop.claimFunds()
          expect(await unit.balanceOf(treasury.address)).to.equal(4000)
          expect(await loop.state()).to.equal(await loop.IMPLEMENTING())
          let campaign = await fundraiser.campaigns(1)
          expect(campaign.claimed).to.be.true
        })
  
        
      })

    })

  })

});