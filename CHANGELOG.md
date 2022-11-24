# Changelog

## 2022-11-23 21:30:53

- Planned
  - Add support for doing image prompt variations in the grid:
    - Main image + variant strength
    - Main image + color overlay
  - Add support for name and description on study
  - Add sort and other visual controls on the study view

## 2022-11-22 22:09:26

- Improve the SubPicker by allowing extra choices to be sent back to the main page
- Add support for selecting images and showing side by side
- Add support for global layer that checks if an image exists -- this will replace placeholder with actual image

## 2022-11-21 22:13:38

- Add support to the `SubPicker` to show the chooser menu and active options

## 2022-11-20 23:17:13

- Consolidate the various `Picker` calls into a single common factory
- Add support for `settings` to the study def

## 2022-11-20 15:23:56

- Add a `SubPicker` which handles showing an interface for studies on a substitution
- Small tweaks related to managing studies with substitutions - more needed

## 2022-11-19 20:57:26

- Add support for saving studies to the database
- Add a page that allows for a study to be loaded on its own
- Show a list of saved studies on the group page -- maybe show these results in-line where the grid used to be shown
- Expand UX around studies to support subs (and maybe image variants too)

## 2022-11-18 21:47:15

- Start to add features back into the study builder
- Allow for a range of controls when creating a study
- Remove types related to the `NumDelta` transforms - not needed?

## 2022-11-17 22:28:41

- Pull the ImageStudy into its own component and allow them to be saved on their own
- Improve image sameness check by including variant and other image prompt fields

## 2022-11-16 22:46:05

- Add support for saving the image prompt and associated mask
- Add support for greyscale image filtering - Chrome only - no safari

## 2022-11-15 21:41:50

- Resolve errors around broken grid display - bad boolean logic
- Ensure that `create` button will go to a spinner while loading
- Add a `color picker` to the image editor
- Add a `fill rect` option to the image editor
- Add support for DALL-E in painting and outpainting with mask and image data support
  - This needs to change the mask format for the different engines - code is a mess but works

## 2022-11-13 21:40:41

- Start cleaning up old/bad UX stuff
  - Remove the `xform` button and associated handlers
  - Remove the `modify` button - logic now handled in the `edit` form with the new `isImagePrompt` setting
  - Combine the variant buttons into a single button with menu items
  - Move the various subs into a single menu with a common popup

## 2022-11-13 00:26:38

- Various tweaks to improve image grid with new sub data structures
  - Prevent dupes and remove undefined items
- Add a filter to the sub chooser

## 2022-11-09 23:05:16

- Improve image editing -- add a pencil to draw color
  - Allow the mask to be disabled so that variants are generated based on the image prompt

## 2022-11-09 00:47:36

- Add support for in-painting and out-painting via a source image and mask

## 2022-11-07 21:52:53

- Improve the substitutions engine to;
  - Auto detect available selections in current image
  - Allow for permutation, combination, pick N, or power sets
  - Shuffle as a choice
  - Uses `|` as the delim inside a list of choices - is turned into a comma later
  - Sub lists are stored as arrays internally and joined at the end
  - Ensure that all possible sub counts are accurate
- Improve the viewing of images that contain a given artist name
  - Next: look into performance and caching on this logic
- Warn on creation if the prompt is dirty
- Sort CardViewer by prompt length (roughly shows order for most mods)
- Add `jest` back in (really just for types)

## 2022-11-06 21:42:46

- Allow multiple substitutions to occur in a single place holder
  - This currently shuffles the choices and picks items in groups of N until all items are picked

## 2022-11-06 21:19:28

- Add support for a quick editor for any existing image
  - Will set a new `prevImageId` field and also return the current group

## 2022-11-05 21:42:27

- Add support for creating variations with DALL-E
- Add buttons so that variant can be created for any image (regardless of grid)
- Ensure all image info gets to the database (variant source + strength)
- Improve the card view to allow grouping by a common field
  - Next: support subs and other prompt related things

## 2022-11-05 10:14:38

- Add basic support for creating an SD variant of an image

## 2022-11-04 21:39:55

- Add support for DALL-E and add `openai` packages
  - Disable controls on new prompt form
- Improve visuals and reduce space for row/col var selection
  - Move to `Select` instead of `Radio`

## 2022-11-03 20:49:13

- Ability to add a name to the group and some notes.
- Switch image list to query groups (this give us the name and view settings)
  - Need to create a view or something to get the count (instead of returning all images)
- Rename database columns to remove punctuation
- Ensure that multi substitutions are done - previously only the first match was processed
- Unbreak image deletion - add a prompt ("are you sure")
- Get server side generation working for image list and ImageGrid views

## 2022-11-01 23:01:03

- Continue to add more modifiers
- Add slightly better labels to the modifiers
- Allow the row and column variables to both be modifiers
- Improve main image selection coming from a reload

## 2022-10-31 20:52:58

- Add counts to the substitution choices (replace XXX text)
- Add substitutions to the database
- Improve the `SubChooser` form to support subs that do not have tags yet

## 2022-10-30 22:19:08

- Import a large list of artists and build a selection interface for them
- Store the new view settings on the server
- Allow the sub list to be all available (for review) or from the list of choices

## 2022-10-30 12:20:24

- Improve display of wrapped 1D grid
  - Better header text for substitution
  - Better tracking of main image to prevent dupes -- not quite right yet

## 2022-10-29 22:07:35

- Add support for substitutions as part of the image matrix
  - Currently supports the `artist` label -- more to come
- Provide for a 1D view based on the row variable - allow for clean studies of large spaces
  - Persist this to the group data save

## 2022-10-29 10:18:26

- Show the number of unique entries next to the variable choosers
- Persist main image selection to the group view
  - Not perfect yet - react-query updates do weird things
- Add a stable JSON stringify to find unique transforms - better de dupe
- Prevent react-query updates on window focus
- Improve UX for the main page
- Add a proper navigation bar - add create link to top
- Remove the image transform builder from index
- Remove extra `console.log` calls

## 2022-10-28 21:35:04

- Add an `index` to the text add/remove process ensure consistent ordering of prompt
- Improve delta detection by grouping together text edits that are a package deal
  - This ensures that original images can be regenerated by reversing the delta
- Allow for bulk generation of all visible place holder images
- Default to card view
- Tighten the width on the create prompt page - also allow the TextArea to grow as needed

## 2022-10-27 23:32:49

- Improve display of `ImageGrid` by showing a card view that emphasizes all images in group

## 2022-10-23 22:04:51

- Move the old `loose` transforms into the same bucket as the "unknown" -- these are all meant to be prompt edits
- Force those loose ones to be normalized so that they produce the add/remove style instead of the `set` style
  - This works except for when editing something at the start of a prompt...
- Adds support for the `extraChoices` with the new xform builder
- Add a prompt xform button in the first column of the row -- should probably only show for main image?
- Move `gen` button to top so it's never hidden on long prompts
- Allow prompt builder thing to be reset -- probably should happen automatically?
- Remove `loose` as a variable choice - prompt changes now in `unknown`
- Improve how the `mainImage` is selected - explicit button instead of clicking in the cell

## 2022-10-22 22:24:19

- Add the new grid xform display to the column (and row)
- Ensure correct display and sorting for non-text xforms
- This work was not completed -- had to stop mid process

## 2022-10-21 21:53:35

- Add support for deleting whole groups of images
- Start reworking the grid display to show delta for prompts and add sorting

## 2022-10-18 21:26:55

- Created a table for group info
  - Use this to store default and saved view settings
  - Pushed all active images into this table for now

## 2022-10-17 22:12:54

- Allow images to be saved to `/tmp` -- avoid excess S3 calls
  - Also track bad files and do not load more than once -- will need to track count or something
- Remove prompt pieces -- all are now "unknown"
- Default transform to be based on the full prompt instead of a delta (update later?)
- Default the sort to be based on total prompt length (more commas = more items)

## 2022-10-15 23:31:53

- Split into pages
- Remove bad image groups
- Move server to /api folder
- Move all secrets into .env file for environment access
- Move into new project that is Next.js only
- Deploy to Vercel
- Change image path to `/tmp`
  - Vercel does not allow writing to other folders

## 2022-10-15 00:23:01

- Move to supabase for the database -- pushed all existing images into database
  - This removes the need for sqlite
- Update stability client to resolve error

## 2022-10-06 21:31:55

- Rework image storage and access to use S3
- Resolve issue related to `steps` not working as a choice

## 2022-10-05 22:39:56

- Swap out the Python SDK for a JS one

## 2022-10-04 20:59:52

- Rework common libs to avoid importing lodash on the server
- Rework the transform system to change how the grid displays
- Allow a prompt to be quickly edited to produce transforms

## 2022-10-03 21:07:49

- Add ability to detect differences between images and groups of images
- Display those values in table -- will be used to drive the new grid interface

## 2022-10-02 23:10:56

- Rework the prompt modifier to use a set of transforms instead of directly editing properties

Next steps: allow for an existing prompt to be the basis of transforms; build an interface to show progressive updates to a prompt, improve logic on add prompt text and sync with labels, show those labels

## 2022-09-30 22:11:16

- Add a detailed prompt editor with various controls for quickly editing the prompt
- Add the ability to control and vary the artist in a prompt

## 2022-09-29 22:13:00

- Click on an image to show full size
- Much greater control over the grid display
- Move to HTML table instead of CSS grid
- Ensure that images are loaded as soon as possible
- Clean up logging calls
- Better visuals on the new prompt -- and allow the seed to be set
