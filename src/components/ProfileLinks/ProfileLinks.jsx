// import React from 'react'
// import NewProfileLink from '../NewProfileLink'

// const ProfileLinksCard = ({
// 	data: links,
// 	canEdit,
// 	label,
// 	handleProfileLinks,
// 	collection
// }) => {

// 	return (
// 		<div className='card border-secondary w-100'>
// 			<div className='card-body'>
// 				<h4 className='card-title'>{label} Links</h4>
// 				<h6 className='card-subtitle mb-2 text-muted'>
// 					{links.length === 0 ? `No ${label} link defined` : ''}
// 				</h6>
// 				<div className='card-text'>
// 					{links.map((link, index) => (
// 						<div className='form-group row' key={link.Name + link.Link}>
// 							<label htmlFor='' className='label col-2'>
// 								{link.Name}
// 							</label>
// 							<a
// 								href={link.Link}
// 								className='col-8'
// 								target='_blank'
// 								rel='noopener noreferrer'
// 								data-toggle='tooltip'
// 								data-placement='bottom'>
// 								<input
// 									type='url'
// 									className='form-control col-12'
// 									value={link.Link}
// 									readOnly
// 								/>
// 							</a>
// 							{canEdit && (
// 								<span
// 									className='fa fa-trash pull-right col-1 label'
// 									data-toggle='tooltip'
// 									data-placement='right'
// 									title='Remove this link'
// 									onClick={() =>
// 										handleProfileLinks(collection, link, 'delete', index)
// 									}></span>
// 							)}
// 						</div>
// 					))}
// 					{canEdit && (
// 						<NewProfileLink
// 							label={label}
// 							onSubmit={handleProfileLinks}
// 							collection={collection}
// 						/>
// 					)}
// 				</div>
// 			</div>
// 		</div>
// 	)
// }

// export default ProfileLinksCard
