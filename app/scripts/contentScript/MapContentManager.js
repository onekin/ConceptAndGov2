// PVSCL:IFCOND(CodebookUpdate, LINE)
import Theme from '../codebook/model/Theme'
// PVSCL:ENDCOND
import LanguageUtils from '../utils/LanguageUtils'
import _ from 'lodash'
import Events from '../Events'
// PVSCL:IFCOND(Linking, LINE)
import LinkingManagementForm from '../annotationManagement/purposes/linking/LinkingManagementForm'
import Alerts from '../utils/Alerts'
// PVSCL:ENDCOND

export class Concept {
  constructor (theme = null, evidenceAnnotations = []) {
    // code
    this.theme = theme
    this.evidenceAnnotations = evidenceAnnotations
  }
}
// PVSCL:IFCOND(Linking, LINE)

export class Relationship {
  constructor (id = null, fromConcept = null, toConcept = null, linkingWord = '', annotations = [], cxlID = '') {
    this.id = id
    this.fromConcept = fromConcept
    this.toConcept = toConcept
    this.linkingWord = linkingWord
    this.evidenceAnnotations = annotations
    this.cxlID = cxlID
  }
}
// PVSCL:ENDCOND

export class MapContentManager {
  constructor () {
    this.concepts = {}
    // PVSCL:IFCOND(Linking, LINE)
    this.relationships = []
    // PVSCL:ENDCOND
    this.events = {}
  }

  init (callback) {
    console.debug('Initializing MapContentManager')
    // Retrieve all the annotations for this assignment
    this.updateMapContent(() => {
      console.debug('Initialized MapContentManager')
      if (_.isFunction(callback)) {
        callback()
      }
    })
    // Init event handlers
    this.initThemeCreatedEvent()
    this.initThemeUpdatedEvent()
    this.initThemeRemovedEvent()
    this.initLinkAnnotationCreatedEvent()
    this.initLinkAnnotationDeletedEvent()
    this.initLinkAnnotationUpdatedEvent()
    this.initEvidenceAnnotationAddedEvent()
    this.initEvidenceAnnotationRemovedEvent()
  }

  initThemeCreatedEvent () {
    this.events.themeCreatedEvent = { element: document, event: Events.themeCreated, handler: this.themeCreatedEventHandler() }
    this.events.themeCreatedEvent.element.addEventListener(this.events.themeCreatedEvent.event, this.events.themeCreatedEvent.handler, false)
  }

  initThemeUpdatedEvent () {
    this.events.themeUpdatedEvent = { element: document, event: Events.themeUpdated, handler: this.themeUpdatedEventHandler() }
    this.events.themeUpdatedEvent.element.addEventListener(this.events.themeUpdatedEvent.event, this.events.themeUpdatedEvent.handler, false)
  }

  initThemeRemovedEvent () {
    this.events.themeRemovedEvent = { element: document, event: Events.themeRemoved, handler: this.themeRemovedEventHandler() }
    this.events.themeRemovedEvent.element.addEventListener(this.events.themeRemovedEvent.event, this.events.themeRemovedEvent.handler, false)
  }
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(Linking,LINE)

  initLinkAnnotationCreatedEvent () {
    this.events.linkAnnotationCreatedEvent = { element: document, event: Events.linkAnnotationCreated, handler: this.linkAnnotationCreatedEventHandler() }
    this.events.linkAnnotationCreatedEvent.element.addEventListener(this.events.linkAnnotationCreatedEvent.event, this.events.linkAnnotationCreatedEvent.handler, false)
  }

  initLinkAnnotationDeletedEvent () {
    this.events.linkAnnotationDeletedEvent = { element: document, event: Events.linkAnnotationDeleted, handler: this.linkAnnotationDeletedEventHandler() }
    this.events.linkAnnotationDeletedEvent.element.addEventListener(this.events.linkAnnotationDeletedEvent.event, this.events.linkAnnotationDeletedEvent.handler, false)
  }

  initLinkAnnotationUpdatedEvent () {
    this.events.linkAnnotationUpdatedEvent = { element: document, event: Events.linkAnnotationUpdated, handler: this.linkAnnotationUpdatedEventHandler() }
    this.events.linkAnnotationUpdatedEvent.element.addEventListener(this.events.linkAnnotationUpdatedEvent.event, this.events.linkAnnotationUpdatedEvent.handler, false)
  }
  // PVSCL:ENDCOND

  // PVSCL:IFCOND(EvidenceAnnotations,LINE)
  initEvidenceAnnotationRemovedEvent () {
    this.events.evidenceAnnotationRemovedEvent = { element: document, event: Events.evidenceAnnotationRemoved, handler: this.evidenceAnnotationRemovedEventHandler() }
    this.events.evidenceAnnotationRemovedEvent.element.addEventListener(this.events.evidenceAnnotationRemovedEvent.event, this.events.evidenceAnnotationRemovedEvent.handler, false)
  }

  initEvidenceAnnotationAddedEvent () {
    this.events.evidenceAnnotationAddedEvent = { element: document, event: Events.evidenceAnnotationAdded, handler: this.evidenceAnnotationAddedEventHandler() }
    this.events.evidenceAnnotationAddedEvent.element.addEventListener(this.events.evidenceAnnotationAddedEvent.event, this.events.evidenceAnnotationAddedEvent.handler, false)
  }
  // PVSCL:ENDCOND

  destroy () {
    // Remove event listeners
    const events = _.values(this.events)
    for (let i = 0; i < events.length; i++) {
      events[i].element.removeEventListener(events[i].event, events[i].handler)
    }
  }

  updateMapContent (callback) {
    // Retrieve all the annotations for this assignment
    this.createConcepts((err) => {
      if (err) {
        // TODO Unable to retrieve annotations for this assignment
      } else {
        console.debug('Updated annotations for assignment')
        // PVSCL:IFCOND(Linking, LINE)
        // Retrieve current annotatedThemes
        this.createRelationships(() => {
          LanguageUtils.dispatchCustomEvent(Events.relationshipsLoaded, {})
          console.debug('Updated annotations for assignment')
          // Callback
          if (_.isFunction(callback)) {
            callback()
          }
        })
        // PVSCL:ELSECOND
        if (_.isFunction(callback)) {
          callback()
        }
        // PVSCL:ENDCOND
      }
    })
  }
  // PVSCL:IFCOND(CodebookUpdate,LINE)

  themeCreatedEventHandler () {
    return (event) => {
      // retrieve theme object
      const theme = Theme.fromAnnotation(event.detail.newThemeAnnotation, window.abwa.codebookManager.codebookReader.codebook)
      const conceptEvidenceAnnotation = _.filter(window.abwa.annotationManagement.annotationReader.groupClassifiyingAnnotations, (annotation) => {
        return annotation.body[0].value.id === theme.id
      })
      const concept = new Concept(theme, conceptEvidenceAnnotation)
      this.concepts.push(concept)
    }
  }

  themeRemovedEventHandler () {
    return (event) => {
      // remove concept
      const theme = event.detail.theme
      // remove concept
      this.concepts = _.filter(this.concepts, (concept) => {
        return !(concept.theme.id === theme.id)
      })
      // PVSCL:IFCOND(Linking, LINE)
      // remove relations where the removed concept appears
      this.relationships = _.filter(this.relationships, (relation) => {
        return !(relation.fromConcept.id === theme.id || relation.toConcept.id === theme.id)
      })
      LanguageUtils.dispatchCustomEvent(Events.relationshipsLoaded, {})
      // PVSCL:ENDCOND
    }
  }

  themeUpdatedEventHandler () {
    return (event) => {
      this.createConcepts((err) => {
        if (err) {
          // TODO Unable to retrieve annotations for this assignment
        } else {
          console.debug('Updated annotations for assignment')
          // PVSCL:IFCOND(Linking, LINE)
          // Retrieve current annotatedThemes
          this.createRelationships(() => {
            LanguageUtils.dispatchCustomEvent(Events.relationshipsLoaded, {})
            console.debug('Updated annotations for assignment')
          })
          // PVSCL:ENDCOND
        }
      })
    }
  }
  // PVSCL:ENDCOND

  createConcepts (callback) {
    const conceptsList = []
    const themes = window.abwa.codebookManager.codebookReader.codebook.themes
    const filteredThemes = themes.filter((theme) => {
      return !theme.isMisc
    })

    if (filteredThemes) {
      for (let i = 0; i < filteredThemes.length; i++) {
        const theme = filteredThemes[i]
        const conceptEvidenceAnnotation = _.filter(window.abwa.annotationManagement.annotationReader.groupClassifiyingAnnotations, (annotation) => {
          return annotation.body[0].value.id === theme.id
        })
        const concept = new Concept(theme, conceptEvidenceAnnotation)
        conceptsList.push(concept)
      }
    }
    this.concepts = conceptsList
    if (_.isFunction(callback)) {
      callback(null)
    }
  }
  // PVSCL:IFCOND(Linking, LINE)

  createRelationships (callback) {
    this.relationships = []
    const linkingAnnotations = window.abwa.annotationManagement.annotationReader.groupLinkingAnnotations
    for (let i = 0; i < linkingAnnotations.length; i++) {
      const linkAnnotation = linkingAnnotations[i]
      const linkingObject = linkAnnotation.body[0]
      const from = window.abwa.codebookManager.codebookReader.codebook.getCodeOrThemeFromId(linkingObject.value.from)
      const to = window.abwa.codebookManager.codebookReader.codebook.getCodeOrThemeFromId(linkingObject.value.to)
      const linkingWord = linkingObject.value.linkingWord
      const relation = this.findRelationship(from, to, linkingWord)
      if (relation) {
        relation.evidenceAnnotations.push(linkAnnotation)
        if (linkAnnotation.linkingCXLid !== '') {
          relation.cxlID = linkAnnotation.linkingCXLid
        }
      } else {
        let newRelation
        if (linkAnnotation.linkingCXLid !== '') {
          newRelation = new Relationship(linkAnnotation.id, from, to, linkingWord, [], linkAnnotation.linkingCXLid)
        } else {
          newRelation = new Relationship(linkAnnotation.id, from, to, linkingWord, [])
        }
        newRelation.evidenceAnnotations.push(linkAnnotation)
        this.relationships.push(newRelation)
      }
    }
    if (_.isFunction(callback)) {
      callback(null)
    }
  }

  findRelationship (from, to, linkingWord) {
    const relationship = _.find(this.relationships, (relation) => {
      return relation.fromConcept === from && relation.toConcept === to && relation.linkingWord === linkingWord
    })
    return relationship
  }

  findRelationshipById (id) {
    const relationship = _.find(this.relationships, (relation) => {
      return relation.id === id
    })
    return relationship
  }

  manageRelationships (concept) {
    this.getConceptRelationships(concept.id, (conceptRelationships) => {
      console.log(conceptRelationships)
      if (conceptRelationships.length === 0) {
        Alerts.errorAlert({ text: 'You do not have links from the ' + concept.name + ' concept.' })
      } else {
        LinkingManagementForm.showLinkingManagementForm(concept, conceptRelationships, () => {
          //
        })
      }
    })
  }

  getConceptRelationships (conceptId, callback) {
    const conceptRelationships = _.filter(this.relationships, (relation) => {
      return relation.fromConcept.id === conceptId
    })
    if (_.isFunction(callback)) {
      callback(conceptRelationships)
    }
  }

  linkAnnotationCreatedEventHandler () {
    return (event) => {
      const linkAnnotation = event.detail.annotation
      const linkingObject = linkAnnotation.body[0]
      const from = window.abwa.codebookManager.codebookReader.codebook.getCodeOrThemeFromId(linkingObject.value.from)
      const to = window.abwa.codebookManager.codebookReader.codebook.getCodeOrThemeFromId(linkingObject.value.to)
      const linkingWord = linkingObject.value.linkingWord
      const relation = this.findRelationship(from, to, linkingWord)
      if (relation) {
        relation.evidenceAnnotations.push(linkAnnotation)
      } else {
        const newRelation = new Relationship(linkAnnotation.id, from, to, linkingWord, [])
        newRelation.evidenceAnnotations.push(linkAnnotation)
        this.relationships.push(newRelation)
        LanguageUtils.dispatchCustomEvent(Events.relationshipAdded, { relation: newRelation })
      }
    }
  }

  linkAnnotationDeletedEventHandler () {
    return (event) => {
      const removedRelation = event.detail.relation
      _.remove(this.relationships, (relation) => {
        return relation === removedRelation
      })
      LanguageUtils.dispatchCustomEvent(Events.relationshipDeleted, { relation: removedRelation })
    }
  }

  linkAnnotationUpdatedEventHandler () {
    return (event) => {
      const linkAnnotation = event.detail.annotation
      const linkingObject = linkAnnotation.body[0]
      const from = window.abwa.codebookManager.codebookReader.codebook.getCodeOrThemeFromId(linkingObject.value.from)
      const to = window.abwa.codebookManager.codebookReader.codebook.getCodeOrThemeFromId(linkingObject.value.to)
      const linkingWord = linkingObject.value.linkingWord
      const relation = this.findRelationship(from, to, linkingWord)
      if (relation) {
        relation.evidenceAnnotations = []
        relation.evidenceAnnotations.push(linkAnnotation)
        LanguageUtils.dispatchCustomEvent(Events.relationshipUpdated, { relation: relation })
      } else {
        // No updated
      }
    }
  }
  // PVSCL:ENDCOND
  // PVSCL:IFCOND(EvidenceAnnotations,LINE)

  evidenceAnnotationAddedEventHandler () {
    return (event) => {
      const annotation = event.detail.annotation
      const foundConcept = _.filter(this.concepts, (concept) => {
        return concept.theme.id === annotation.body[0].value.id
      })
      foundConcept[0].evidenceAnnotations.push(annotation)
    }
  }

  evidenceAnnotationRemovedEventHandler () {
    return (event) => {
      const annotation = event.detail.annotation
      const foundConcept = _.filter(this.concepts, (concept) => {
        return concept.theme.id === annotation.body[0].value.id
      })
      foundConcept[0].evidenceAnnotations = _.filter(foundConcept.evidenceAnnotations, (evidenceAnnotation) => {
        return evidenceAnnotation.id !== annotation.id
      })
    }
  }
  // PVSCL:ENDCOND
}
